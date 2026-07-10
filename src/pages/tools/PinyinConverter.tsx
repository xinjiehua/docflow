import { useState } from 'react';
import { Type } from 'lucide-react';

export default function PinyinConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const pyMap: Record<string,string> = {'的':'de','是':'shi','不':'bu','了':'le','我':'wo','有':'you','他':'ta','这':'zhe','那':'na','你':'ni','们':'men','在':'zai','和':'he','说':'shuo','都':'dou','就':'jiu','要':'yao','会':'hui','对':'dui','出':'chu','也':'ye','看':'kan','到':'dao','着':'zhe','过':'guo','能':'neng','可':'ke','还':'hai','时':'shi','没':'mei','为':'wei','去':'qu','把':'ba','她':'ta','从':'cong','来':'lai','里':'li','但':'dan','让':'rang','被':'bei','给':'gei','所':'suo','很':'hen','好':'hao','中':'zhong','大':'da','上':'shang','下':'xia','人':'ren','地':'di','得':'de','个':'ge','多':'duo','小':'xiao','年':'nian','一':'yi','二':'er','三':'san','四':'si','五':'wu','六':'liu','七':'qi','八':'ba','九':'jiu','十':'shi','百':'bai','千':'qian','万':'wan','学':'xue','生':'sheng','工':'gong','作':'zuo','国':'guo','家':'jia','天':'tian','日':'ri','月':'yue','明':'ming','星':'xing','风':'feng','雨':'yu','水':'shui','火':'huo','山':'shan','石':'shi','花':'hua','草':'cao','树':'shu','鸟':'niao','鱼':'yu','马':'ma','吃':'chi','喝':'he','走':'zou','跑':'pao','飞':'fei','坐':'zuo','站':'zhan','笑':'xiao','哭':'ku','爱':'ai','想':'xiang','知':'zhi','道':'dao','问':'wen','答':'da','听':'ting','读':'du','写':'xie','画':'hua','唱':'chang','开':'kai','关':'guan','门':'men','书':'shu','笔':'bi','纸':'zhi','字':'zi','文':'wen','语':'yu','话':'hua','名':'ming','城':'cheng','路':'lu','车':'che','船':'chuan','机':'ji','电':'dian','脑':'nao','手':'shou','头':'tou','眼':'yan','耳':'er','口':'kou','心':'xin','身':'shen','钱':'qian','食':'shi','衣':'yi','房':'fang','东':'dong','西':'xi','南':'nan','北':'bei','前':'qian','后':'hou','左':'zuo','右':'you','高':'gao','低':'di','长':'chang','短':'duan','新':'xin','旧':'jiu','白':'bai','黑':'hei','红':'hong','绿':'lv','蓝':'lan','黄':'huang','紫':'zi','金':'jin','银':'yin','铁':'tie','米':'mi','面':'mian','菜':'cai','肉':'rou','汤':'tang','茶':'cha','酒':'jiu','乐':'le','安':'an','平':'ping','快':'kuai','慢':'man','早':'zao','晚':'wan','春':'chun','夏':'xia','秋':'qiu','冬':'dong'};

  const convert = () => {
    const result = [...input].map(ch => pyMap[ch] || ch).join(' ');
    setOutput(result);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="card !p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white"><Type className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-bold text-navy-800">拼音转换</h1><p className="text-sm text-navy-400">将汉字转换为拼音标注</p></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-navy-600 mb-2">输入汉字</label><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="输入汉字文本..." rows={10} className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 text-sm resize-none" /></div>
          <div><label className="block text-sm font-medium text-navy-600 mb-2">拼音结果</label><textarea value={output} readOnly rows={10} className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 bg-navy-50 text-sm resize-none" /></div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={convert} className="btn-primary">转换</button>
          <button onClick={()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2000)}} className="btn-secondary" disabled={!output}>{copied?'已复制':'复制结果'}</button>
          <button onClick={()=>{setInput('');setOutput('')}} className="btn-secondary !text-navy-400">清空</button>
        </div>
      </div>
    </div>
  );
}
