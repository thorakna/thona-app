$.fn.extend({
  animateCss: function(animationName, callback) {
    var animationEnd = (function(el) {
      var animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'mozAnimationEnd',
        WebkitAnimation: 'webkitAnimationEnd',
      };

      for (var t in animations) {
        if (el.style[t] !== undefined) {
          return animations[t];
        }
      }
    })(document.createElement('div'));
    if($(this).css('display') == 'none'){
      $(this).css('display','block');
    }
    this.addClass('animated ' + animationName).one(animationEnd, function() {
      $(this).removeClass('animated ' + animationName);

      if (typeof callback === 'function') callback();
    });

    return this;
  },
});

var app = new Framework7({root:'#app'});
//var mainView = app.views.create('.view-main');

var socket = io.connect('http://192.168.1.34:3520',{
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: Infinity
});
socket.on('connect', ()=>{
  $('#loading').fadeOut(300);
  setTimeout(function (){
    $('#loading').remove();
    $('#cplog').fadeIn(300);
  }, 300);
});

var gpstoggle = app.toggle.create({
  el: '#gpstoggle',
  on: {
    change: function () {
      if(gpstoggle.checked){
        socket.emit('gpsdegis', 'yolla');
      }else{
        socket.emit('gpsdegis', 'yollama');
      }
    }
  }
});

$("#backurl").on('keyup', function (e) {
    if (e.keyCode == 13) {
        var backurl = $('#backurl').val();
        if(backurl != ''){
          socket.emit('back-url',backurl);
          $('#backurl').val('');
        }
    }
});

$('#bonay').click(()=>{
  var backurl = $('#backurl').val();
  if(backurl != ''){
    socket.emit('back-url',backurl);
    $('#backurl').val('');
  }
});

$("#watchtext").on('keyup', function (e) {
    var watchtext = $('#watchtext').val();
    if($.trim(watchtext) !== ''){
      socket.emit('notifver',watchtext);
    }else{
      socket.emit('notifver','Sunucuya bağlandı.');
    }
});

var ilk = true;
var map;
var marker;
var mapOpt;
socket.on('coordin', (koords)=>{
  var user = {lat: koords.lat, lng: koords.long};
  if(!gpstoggle.checked){
    gpstoggle.toggle();
  }
  mapOpt = {
      disableDefaultUI: true,
      panControl: true,
      zoomControl: true,
      zoom: 18,
      center: user,
      mapTypeId: 'hybrid'
  };
  if(ilk){
    ilk = false;
    map = new google.maps.Map(document.getElementById('map'), mapOpt);
    marker = new google.maps.Marker({position: user, map: map, title: koords.usname, animation: google.maps.Animation.DROP});
  }
  marker.setPosition(user);
  map.panTo(user);
});

socket.on('backurl', (url)=>{
  localStorage.setItem('background-url', url);
  $('#back-review').attr('src',url);
});

$(document).ready(()=>{
  var backurl = localStorage.getItem('background-url');
  if(backurl){
    $('#back-review').attr('src',backurl);
  }
});
