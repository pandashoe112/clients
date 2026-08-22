import { chromium } from 'playwright'; import fs from 'fs';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium',
  ignoreDefaultArgs:['--headless=old'], args:['--headless=new','--no-sandbox'] });
const FREEZE = `*,*::before,*::after{animation:none!important;transition:none!important}`;
const shot = async (url,w,path) => {
  const p = await b.newPage({ viewport:{width:w,height:900} });
  await p.goto(url); await p.addStyleTag({content:FREEZE}); await p.waitForTimeout(700);
  await p.evaluate(async()=>{ for(let y=0;y<document.body.scrollHeight;y+=800){scrollTo(0,y);await new Promise(r=>setTimeout(r,20));} scrollTo(0,0); await new Promise(r=>setTimeout(r,250)); });
  await p.screenshot({ path, fullPage:true }); await p.close();
};
const cmp = async (a,c) => {
  const p = await b.newPage();
  const r = await p.evaluate(async ([x,y])=>{
    const load = async d => { const i=new Image(); i.src='data:image/png;base64,'+d; await i.decode(); return i; };
    const [A,B]=await Promise.all([load(x),load(y)]);
    const g=i=>{const cv=document.createElement('canvas');cv.width=i.width;cv.height=i.height;
      const q=cv.getContext('2d');q.drawImage(i,0,0);return q.getImageData(0,0,i.width,i.height).data;};
    const [da,db]=[g(A),g(B)];
    if (A.height!==B.height) return {h:[A.height,B.height]};
    let bad=0, first=-1;
    for (let yy=0;yy<A.height;yy++){ let row=0;
      for (let xx=0;xx<A.width;xx+=2){ const i=(yy*A.width+xx)*4;
        if (Math.abs(da[i]-db[i])>14||Math.abs(da[i+1]-db[i+1])>14||Math.abs(da[i+2]-db[i+2])>14) row++; }
      if (row>3){ bad++; if(first<0) first=yy; } }
    return { h:[A.height,B.height], badRows:bad, firstDiff:first };
  }, [fs.readFileSync(a).toString('base64'), fs.readFileSync(c).toString('base64')]);
  await p.close(); return r;
};
for (const [k,u] of [['index','/'],['seo','/services/seo/'],['ppc','/services/google-ads/']]) {
  for (const [w,t] of [[1440,'d'],[414,'m']]) {
    await shot('file:///home/user/clients/dunk-site/'+k+'.html', w, `/tmp/base/${k}-${t}.png`)
      .catch(()=>{});
    await shot('http://localhost:4321'+u, w, `/tmp/new/${k}-${t}.png`);
    console.log(k, t, JSON.stringify(await cmp(`/tmp/base/${k}-${t}.png`, `/tmp/new/${k}-${t}.png`)));
  }
}
await b.close();
