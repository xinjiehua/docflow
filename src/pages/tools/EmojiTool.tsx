import { useState } from 'react';
import { Smile } from 'lucide-react';
export default function EmojiTool() {
  const [copiedEmoji, setCopiedEmoji] = useState('');
  const cats = [
    {name:"表情",emojis:["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😉","😊","😇","🥰","😍","🤩","😘","😋","😜","🤪","😝","🤑","🤗","🤭","🤔","😐","😑","😶","😏","😒","🙄","😬","😌","😔","😪","😴","😷","🤒","🤕","🤢","😵","🤯","🤠","🥳","😎","🤓","😕","😟","🙁","😮","😯","😲","😳","🥺","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😤","😡","😠","🤬","😈","👿","💀","💩","🤡","👻","👽","🤖"]},
    {name:"手势",emojis:["👋","🤚","🖐","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👍","👎","✊","👊","👏","🙌","👐","🤲","🤝","🙏","💪"]},
    {name:"爱心",emojis:["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝"]},
    {name:"动物",emojis:["🐶","🐱","🐭","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦅","🦆","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜"]},
    {name:"食物",emojis:["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🍒","🍑","🍍","🥝","🍅","🥑","🌶️","🍕","🍔","🍟","🌭","🌮","🥪"]},
    {name:"自然",emojis:["🌸","🌺","🌻","🌹","🌷","🌱","🌲","🌳","🌴","🌿","🍀","🍁","🍂","🌈","☀️","⛅","☁️","🌧️","⛈️","❄️","⭐","🌙","🌍","🔥","💧","🌊"]},
    {name:"物品",emojis:["💡","🔦","📱","💻","⌨️","🖥️","📷","📞","📺","🎧","📚","📖","✏️","🖊️","📝","📎","🔍","🔑","🔒","🔓"]},
    {name:"交通",emojis:["🚗","🚕","🚙","🚌","🏎️","🚓","🚑","🚒","🚐","🚚","🚛","🚜","🚲","🛵","🏍️","✈️","🚀","🚁","⛵","🚢"]},
  ];
  return (
    <div className="max-w-4xl mx-auto px-4 py-8"><div className="card !p-8">
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white"><Smile className="w-6 h-6" /></div><div><h1 className="text-2xl font-bold text-navy-800">Emoji工具</h1><p className="text-sm text-navy-400">点击Emoji即可复制</p></div></div>
      {cats.map(cat=>(<div key={cat.name} className="mb-6"><h3 className="text-sm font-medium text-navy-600 mb-2">{cat.name}</h3><div className="flex flex-wrap gap-2">{cat.emojis.map(e=>(<button key={e} onClick={()=>{navigator.clipboard.writeText(e);setCopiedEmoji(e);setTimeout(()=>setCopiedEmoji(''),1500)}} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-2xl transition-colors ${copiedEmoji===e?'border-brand-500 bg-brand-50':'border-navy-200 hover:border-brand-300 hover:bg-navy-50'}`}>{e}</button>))}</div></div>))}
    </div></div>
  );
}