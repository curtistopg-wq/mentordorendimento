import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const site = request.nextUrl.searchParams.get('site') || ''
  const apiBase = `${request.nextUrl.protocol}//${request.nextUrl.host}`

  const js = generateTracker(apiBase, site)

  return new NextResponse(js, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

function generateTracker(apiBase: string, site: string): string {
  return `(function(){
"use strict";
var API="${apiBase}";
var SITE="${site}";

function gC(n){var m=document.cookie.match(new RegExp("(^| )"+n+"=([^;]+)"));return m?decodeURIComponent(m[2]):null}
function sC(n,v,min){var d=new Date();d.setTime(d.getTime()+min*60000);document.cookie=n+"="+encodeURIComponent(v)+";path=/;expires="+d.toUTCString()+";SameSite=Lax"}

function getSid(){
  var s=gC("_pd_sid");
  if(!s){s="pd_"+Math.random().toString(36).substr(2,9)+"_"+Date.now().toString(36)}
  sC("_pd_sid",s,30);
  return s;
}

function parseUTM(){
  var p=new URLSearchParams(window.location.search);
  var keys=["utm_source","utm_medium","utm_campaign","utm_content","utm_term","fbclid","gclid"];
  var utm={};
  var hasAny=false;
  for(var i=0;i<keys.length;i++){
    var v=p.get(keys[i]);
    if(v){utm[keys[i]]=v;hasAny=true}
  }
  if(hasAny){sC("_pd_utm",JSON.stringify(utm),43200)}
  else{
    var stored=gC("_pd_utm");
    if(stored){try{utm=JSON.parse(stored)}catch(e){}}
  }
  return utm;
}

function trackPageview(){
  var sid=getSid();
  var utm=parseUTM();
  var data={
    session_id:sid,
    site:SITE,
    page_url:window.location.pathname+window.location.search,
    referrer:document.referrer,
    user_agent:navigator.userAgent,
    landing_page:window.location.pathname,
    utm_source:utm.utm_source||null,
    utm_medium:utm.utm_medium||null,
    utm_campaign:utm.utm_campaign||null,
    utm_content:utm.utm_content||null,
    utm_term:utm.utm_term||null,
    fbclid:utm.fbclid||null,
    gclid:utm.gclid||null
  };
  var blob=new Blob([JSON.stringify(data)],{type:"text/plain"});
  navigator.sendBeacon(API+"/api/t/pageview",blob);
}

function trackLead(info){
  var sid=getSid();
  return fetch(API+"/api/t/lead",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      session_id:sid,
      site:SITE,
      name:info.name||null,
      email:info.email||null,
      phone:info.phone||null
    }),
    keepalive:true
  }).then(function(r){return r.json()}).catch(function(e){console.error("PeopleDown lead error:",e);return{status:"error"}});
}

window.PeopleDown={
  trackLead:trackLead,
  getSessionId:getSid,
  trackPageview:trackPageview
};

trackPageview();

var _push=history.pushState;
history.pushState=function(){_push.apply(this,arguments);trackPageview()};
window.addEventListener("popstate",trackPageview);
})();`
}
