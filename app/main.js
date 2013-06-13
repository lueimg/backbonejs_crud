/**
 * @author jall - http://jallander.wordpress.com
 */
 
require.config({
    paths: {
        jquery: 'vendor/jquery.min',
        underscore: 'vendor/underscore',
        backbone: 'vendor/backbone-min',
        localstorage: "vendor/backbone.localStorage-min"
    },
    shim: {
        backbone: {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },

        underscore: {
            deps: ["jquery"],
            exports: "_"
        }
    }
});
require([
    'jquery',
    'underscore',
    'backbone',
    'localstorage'
], function ($, _, Backbone, localstorage) {
	
	// Model
    var Tweet = Backbone.Model.extend({
        defaults: function () {
            return {
                codigo: '',
                fecha: "",
                contenido: ""
            };
        }
    });
 
	// Collection
    var TweetList = Backbone.Collection.extend({
        model: Tweet,
        localStorage: new Backbone.LocalStorage("tweets-backbone")
    });

	// View
    var TweetView = Backbone.View.extend({
        el: $('body'),
        template: _.template($('#item-template').html()),
        model: Tweet,
        events: {
            'click .tweet': 'guardar',
            'focus #textbox': 'countTweetChars',
            'keydown #textbox': 'countTweetChars',
            'keyup #textbox': 'countTweetChars',
            'click .edit': 'editar',
            'click .delete': 'borrar'
        },

        initialize: function () {
            _.bindAll(this, "render", "guardar", "editar", "borrar", "countTweetChars");
            this.countTweetChars();
            this.render();
        },
        render: function () {
            Tweets.fetch();
            $('ol').html(this.template({
                tweets: Tweets.toJSON()
            }));
        },
        guardar: function () {
            var now = new Date();
            var nContenido = $("#textbox").val();
            if (nContenido === "") {
                $("#textbox").val('Debe escribir algo');
                return true;
            }
            var nFecha = now;
            if ($(".tweet").val() === '0') {
                var nCodigo = (!Tweets.length) ? 1 : Tweets.last().get('codigo') + 1;
                var nTweet = new Tweet({
                    fecha: nFecha,
                    contenido: nContenido,
                    codigo: nCodigo
                });
                Tweets.add(nTweet);
                nTweet.save();
            } else {
                var cTweet = Tweets.get($('.tweet').val());
                cTweet.attributes.contenido = nContenido;
                cTweet.save();
            }
            $("#textbox").val("");
            $(".tweet").val(0);
            this.render();
        },
        editar: function (ev) {
            Tweets.fetch();
            var cTweet = Tweets.get($(ev.currentTarget).val());
            $("#textbox").val(cTweet.attributes.contenido);
            $(".tweet").val($(ev.currentTarget).val());
        },
        borrar: function (ev) {
            var cTweet = Tweets.get($(ev.currentTarget).val());
            cTweet.destroy();
            $("#textbox").val("");
            $(".tweet").val(0);
            this.render();
        },
        countTweetChars: function () {
            var textCounter = $("#char_count");
            var count = 140 - $("#textbox").val().length;
            var sobrante = $("#textbox").val().slice(140, $("#textbox").val().length);
            if (count < 0) {
                textCounter.html("<span style='color: #f00;'>" + count + "</span>");
                $('#sobrante').html(sobrante);
                $(".tweet").attr('disabled', 'disabled');
            } else {
                $(".tweet").removeAttr('disabled');
                textCounter.html(count);
                $('#sobrante').html('');
            }
        }
    });

    //  Run TwetApp
    var Tweets = new TweetList();
    var TweetApp = new TweetView();
});
