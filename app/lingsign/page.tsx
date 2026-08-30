'use client';
import {
  ArrowLeft,
  Loader2,
  ScrollText,
  Star,
  Heart,
  Briefcase,
  Home,
  DollarSign,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

const LINGQIAN = [
  {
    id: 1,
    title: '龙吟虎啸',
    poem: '龙吟虎啸势冲天，一跃龙门万事全。\n从此不须忧患事，功名富贵在眼前。',
    fortune: '大吉',
    love: '姻缘美满，有情人终成眷属',
    career: '事业腾飞，前途无量',
    wealth: '财运亨通，意外之财',
    health: '身体康健，精力充沛',
    advice: '运势极佳，把握机会，勇往直前。',
  },
  {
    id: 2,
    title: '花逢春雨',
    poem: '花逢春雨正当时，一朵芳菲映日辉。\n莫道东风无意绪，枝头已有鹊来栖。',
    fortune: '吉',
    love: '桃花运旺，新的恋情即将到来',
    career: '工作顺利，有晋升机会',
    wealth: '收入稳定，可适当投资',
    health: '注意休息，避免过度劳累',
    advice: '好运将至，保持积极心态。',
  },
  {
    id: 3,
    title: '月照寒潭',
    poem: '月照寒潭影自清，一声雁过楚天明。\n此身已在蓬莱境，何必区区问利名。',
    fortune: '中吉',
    love: '感情平淡但稳定，珍惜当下',
    career: '工作平稳，不宜冒进',
    wealth: '收支平衡，不宜大额投资',
    health: '身体无大碍，保持锻炼',
    advice: '内心平静，顺应自然。',
  },
  {
    id: 4,
    title: '枯木逢春',
    poem: '枯木逢春又发枝，旧时燕子入帘帷。\n东风若解相思意，莫遣芳菲尽日催。',
    fortune: '吉',
    love: '旧情复燃或新的开始',
    career: '困境将过，新的机遇到来',
    wealth: '财运好转，可谨慎投资',
    health: '身体恢复，注意保养',
    advice: '困境将过，新的开始即将到来。',
  },
  {
    id: 5,
    title: '镜花水月',
    poem: '镜中花影水中月，看得分明摸不着。\n劝君莫要苦追求，到头来是空劳碌。',
    fortune: '平',
    love: '感情虚幻，不要过于执着',
    career: '目标不切实际，需要调整',
    wealth: '投资需谨慎，避免被骗',
    health: '注意心理健康，保持乐观',
    advice: '不要过于执着，顺其自然。',
  },
  {
    id: 6,
    title: '鹤立鸡群',
    poem: '鹤立鸡群自不同，一鸣惊人动苍穹。\n此身合是麒麟种，不与凡禽共始终。',
    fortune: '大吉',
    love: '魅力四射，追求者众多',
    career: '才华展现，脱颖而出',
    wealth: '收入大增，事业有成',
    health: '精力充沛，状态极佳',
    advice: '脱颖而出的机会来了。',
  },
  {
    id: 7,
    title: '柳暗花明',
    poem: '山重水复疑无路，柳暗花明又一村。\n莫道前途无知己，天涯何处无芳人。',
    fortune: '吉',
    love: '转机将至，不要放弃希望',
    career: '困境突破，新的方向',
    wealth: '财运好转，否极泰来',
    health: '身体康复，保持乐观',
    advice: '转机将至，不要放弃希望。',
  },
  {
    id: 8,
    title: '守株待兔',
    poem: '守株待兔枉劳神，何不回头问自身。\n勤勉耕耘终有获，莫教岁月误青春。',
    fortune: '平',
    love: '主动出击比等待更好',
    career: '需要努力，不能坐等',
    wealth: '收入平平，需要开源',
    health: '注意锻炼，保持健康',
    advice: '主动出击比等待更好。',
  },
  {
    id: 9,
    title: '鹏程万里',
    poem: '鹏程万里任翱翔，海阔天空任我狂。\n莫道前路多险阻，乘风破浪向前方。',
    fortune: '大吉',
    love: '感情顺利，幸福美满',
    career: '事业大展，前途光明',
    wealth: '财运旺盛，可大胆投资',
    health: '身体强健，精力旺盛',
    advice: '前途光明，大展宏图。',
  },
  {
    id: 10,
    title: '竹篮打水',
    poem: '竹篮打水一场空，劝君凡事要从容。\n急功近利终无益，静待时机自然通。',
    fortune: '平',
    love: '感情需要耐心经营',
    career: '急于求成反而是祸',
    wealth: '投资需谨慎，避免亏损',
    health: '注意休息，避免过劳',
    advice: '耐心等待，不要急于求成。',
  },
  {
    id: 11,
    title: '喜鹊登枝',
    poem: '喜鹊登枝报好音，东风送暖入瑶琴。\n此时若得心头愿，万事亨通遂意心。',
    fortune: '大吉',
    love: '喜事将近，姻缘美满',
    career: '好消息传来，事业顺利',
    wealth: '横财运旺，意外收获',
    health: '身体康健，心情愉悦',
    advice: '喜事将近，把握机会。',
  },
  {
    id: 12,
    title: '春笋破土',
    poem: '春笋破土势如虹，节节高升入碧空。\n他日若遂凌云志，敢笑黄巢不丈夫。',
    fortune: '吉',
    love: '感情升温，关系更进一步',
    career: '步步高升，有晋升机会',
    wealth: '收入增长，积蓄渐多',
    health: '身体强壮，精力充沛',
    advice: '稳步前进，会有好结果。',
  },
  {
    id: 13,
    title: '秋水长天',
    poem: '秋水长天共一色，孤鹜落霞齐飞时。\n人生难得几回醉，莫负良辰美景期。',
    fortune: '中吉',
    love: '感情平稳，珍惜当下',
    career: '工作顺利，保持现状',
    wealth: '收支平衡，稳健理财',
    health: '身体无碍，保持锻炼',
    advice: '享受当下，珍惜时光。',
  },
  {
    id: 14,
    title: '寒梅傲雪',
    poem: '寒梅傲雪独芬芳，不与群芳竞短长。\n待到山花烂漫时，她在丛中笑春光。',
    fortune: '吉',
    love: '坚守终有回报，真爱将至',
    career: '逆境中坚持，终会成功',
    wealth: '节俭持家，积蓄渐增',
    health: '注意保暖，预防感冒',
    advice: '坚持就是胜利，好运将至。',
  },
  {
    id: 15,
    title: '水中捞月',
    poem: '水中捞月枉费心，镜里观花不认真。\n劝君莫把虚花恋，脚踏实地做真人。',
    fortune: '平',
    love: '不要被表象迷惑',
    career: '目标不切实际，需要务实',
    wealth: '避免投机，稳健理财',
    health: '注意心理健康',
    advice: '脚踏实地，不要好高骛远。',
  },
  {
    id: 16,
    title: '紫气东来',
    poem: '紫气东来满室春，祥云瑞霭罩门庭。\n此时正值兴隆日，万事如意遂心愿。',
    fortune: '大吉',
    love: '姻缘天定，幸福美满',
    career: '事业兴旺，贵人相助',
    wealth: '财运大旺，可大胆发展',
    health: '身体康健，精力充沛',
    advice: '把握时机，大展宏图。',
  },
  {
    id: 17,
    title: '雨后彩虹',
    poem: '雨过天晴见彩虹，乌云散尽见光明。\n苦尽甘来终有日，守得云开见月明。',
    fortune: '吉',
    love: '困难过后，感情更坚固',
    career: '渡过难关，迎来转机',
    wealth: '财务好转，逐渐富裕',
    health: '身体康复，更加健康',
    advice: '坚持度过难关，美好将至。',
  },
  {
    id: 18,
    title: '画饼充饥',
    poem: '画饼充饥终是空，望梅止渴亦无功。\n劝君脚踏实地行，莫把幻想作真功。',
    fortune: '平',
    love: '感情需要实际行动',
    career: '空想无益，需要实干',
    wealth: '投资需谨慎，避免亏损',
    health: '注意身体健康',
    advice: '脚踏实地，付诸行动。',
  },
  {
    id: 19,
    title: '鱼跃龙门',
    poem: '鱼跃龙门变化龙，一朝得志入云中。\n十年寒窗无人问，一举成名天下知。',
    fortune: '大吉',
    love: '感情突破，关系升华',
    career: '事业飞跃，名利双收',
    wealth: '财运大旺，收入倍增',
    health: '身体强健，精力旺盛',
    advice: '抓住机遇，实现突破。',
  },
  {
    id: 20,
    title: '塞翁失马',
    poem: '塞翁失马焉知非，祸福相依自有期。\n莫因一时失意事，便把平生壮志亏。',
    fortune: '中吉',
    love: '感情中的挫折可能是转机',
    career: '暂时的失败是成功的铺垫',
    wealth: '失财不必过于伤心',
    health: '小病无大碍，注意保养',
    advice: '祸福相依，保持乐观。',
  },
  {
    id: 21,
    title: '春风化雨',
    poem: '春风化雨润无声，万物复苏气象新。\n此时正是播种日，辛勤耕耘待秋成。',
    fortune: '吉',
    love: '感情滋润，关系和谐',
    career: '工作顺利，有新机会',
    wealth: '收入稳定，可适当投资',
    health: '身体舒适，心情愉快',
    advice: '播种的好时机，努力耕耘。',
  },
  {
    id: 22,
    title: '悬崖勒马',
    poem: '悬崖勒马回头岸，苦海无边回头是。\n及早回头犹未晚，莫待无花空折枝。',
    fortune: '中吉',
    love: '感情中的问题需要及时解决',
    career: '工作中要防止错误',
    wealth: '投资需谨慎，见好就收',
    health: '注意不良习惯，及时改正',
    advice: '及时反省，改正错误。',
  },
  {
    id: 23,
    title: '水到渠成',
    poem: '水到渠成自然成，瓜熟蒂落理当然。\n莫急莫躁耐心等，功到自然在眼前。',
    fortune: '吉',
    love: '感情顺其自然，会有好结果',
    career: '时机成熟，事业有成',
    wealth: '财富自然而来，不必强求',
    health: '身体自然健康，保持好习惯',
    advice: '顺其自然，不要强求。',
  },
  {
    id: 24,
    title: '一帆风顺',
    poem: '一帆风顺到天涯，万里行程一日达。\n此去前程无限好，春风得意马蹄疾。',
    fortune: '大吉',
    love: '感情顺利，幸福美满',
    career: '事业顺利，一帆风顺',
    wealth: '财运亨通，收入丰厚',
    health: '身体康健，精力充沛',
    advice: '把握时机，勇往直前。',
  },
  {
    id: 25,
    title: '柳暗花明',
    poem: '行到水穷处，坐看云起时。\n偶然值林叟，谈笑无还期。',
    fortune: '吉',
    love: '意外的相遇可能带来惊喜',
    career: '困境中会有新的发现',
    wealth: '财务状况会好转',
    health: '保持乐观，身体会更好',
    advice: '换个角度思考，会有新发现。',
  },
  {
    id: 26,
    title: '登高望远',
    poem: '登高望远视野宽，一览众山小如丸。\n站得高时看得远，胸怀壮志上云端。',
    fortune: '吉',
    love: '眼光放长远，会有好姻缘',
    career: '格局要大，志向要远',
    wealth: '长远投资会有好回报',
    health: '保持运动，增强体质',
    advice: '眼光放长远，不要局限于眼前。',
  },
  {
    id: 27,
    title: '落叶归根',
    poem: '落叶归根土中藏，来年春暖又发芽。\n人生起伏如四季，循环往复总有常。',
    fortune: '中吉',
    love: '珍惜眼前人，不要好高骛远',
    career: '回归本心，踏实工作',
    wealth: '稳健理财，积蓄为上',
    health: '注意养生，顺应自然',
    advice: '回归本心，脚踏实地。',
  },
  {
    id: 28,
    title: '破茧成蝶',
    poem: '破茧成蝶展翅飞，历经磨难见光辉。\n不经一番寒彻骨，怎得梅花扑鼻香。',
    fortune: '吉',
    love: '经历考验后感情更坚固',
    career: '克服困难后事业有成',
    wealth: '渡过难关后财运好转',
    health: '康复后更加健康',
    advice: '坚持度过困难，美好将至。',
  },
  {
    id: 29,
    title: '纸上谈兵',
    poem: '纸上谈兵终觉浅，绝知此事要躬行。\n空谈误国实干兴，脚踏实地方为真。',
    fortune: '平',
    love: '感情需要实际行动',
    career: '空谈无益，需要实干',
    wealth: '投资需谨慎，避免亏损',
    health: '注意身体健康',
    advice: '付诸行动，不要空谈。',
  },
  {
    id: 30,
    title: '梅花三弄',
    poem: '梅花三弄报春来，一枝独秀映雪开。\n莫道寒冬无美景，暗香浮动月徘徊。',
    fortune: '吉',
    love: '感情中有惊喜',
    career: '工作中有新的发现',
    wealth: '有意外收入',
    health: '心情愉快，身体舒适',
    advice: '发现生活中的美好。',
  },
  {
    id: 31,
    title: '稳如泰山',
    poem: '稳如泰山不动摇，任凭风浪起波涛。\n心中自有定盘星，何惧前途路迢迢。',
    fortune: '吉',
    love: '感情稳定，可以信赖',
    career: '工作稳定，稳步前进',
    wealth: '财务稳健，积蓄渐增',
    health: '身体强健，状态良好',
    advice: '保持稳定，不要冒进。',
  },
  {
    id: 32,
    title: '蜻蜓点水',
    poem: '蜻蜓点水太匆匆，一事无成万事空。\n劝君做事要彻底，莫学浮萍随波逐。',
    fortune: '平',
    love: '感情需要深入经营',
    career: '做事要彻底，不能半途而废',
    wealth: '理财要稳健，不能投机',
    health: '注意细节，预防小病',
    advice: '做事要彻底，不能浅尝辄止。',
  },
  {
    id: 33,
    title: '金玉满堂',
    poem: '金玉满堂富且贵，儿孙绕膝乐无涯。\n积善之家有余庆，福禄寿喜聚一家。',
    fortune: '大吉',
    love: '家庭美满，儿孙满堂',
    career: '事业成功，名利双收',
    wealth: '财运大旺，富贵荣华',
    health: '身体康健，长寿安康',
    advice: '积善行德，福报自来。',
  },
  {
    id: 34,
    title: '孤舟独桨',
    poem: '孤舟独桨过重洋，风浪之中独自航。\n前路漫漫多艰险，咬紧牙关莫彷徨。',
    fortune: '中吉',
    love: '感情中需要独立',
    career: '独自奋斗，终会成功',
    wealth: '独立创业，会有收获',
    health: '注意休息，避免过劳',
    advice: '坚持独立，终会成功。',
  },
  {
    id: 35,
    title: '花开富贵',
    poem: '花开富贵满堂春，蝶舞蜂飞喜气新。\n此时正是好时节，把握机会莫迟疑。',
    fortune: '大吉',
    love: '桃花运旺，姻缘美满',
    career: '事业兴旺，机会多多',
    wealth: '财运旺盛，收入丰厚',
    health: '身体康健，精力充沛',
    advice: '把握好时机，勇敢追求。',
  },
  {
    id: 36,
    title: '月缺月圆',
    poem: '月缺月圆自有期，人生起伏亦如斯。\n莫因暂时失意事，便忘平生凌云志。',
    fortune: '中吉',
    love: '感情有起有落，顺其自然',
    career: '事业有波动，保持信心',
    wealth: '财务有起伏，稳健理财',
    health: '身体有小恙，注意保养',
    advice: '保持信心，低谷会过去。',
  },
  {
    id: 37,
    title: '脚踏实地',
    poem: '脚踏实地稳步行，一步一个脚印深。\n莫学浮萍随波逐，扎实根基万事成。',
    fortune: '吉',
    love: '感情需要稳扎稳打',
    career: '工作踏实，会有成就',
    wealth: '稳健理财，积蓄渐增',
    health: '坚持锻炼，身体强健',
    advice: '稳扎稳打，步步为营。',
  },
  {
    id: 38,
    title: '守得云开',
    poem: '守得云开见月明，苦尽甘来终有成。\n坚持到底不放弃，胜利曙光在前程。',
    fortune: '吉',
    love: '坚持等待，真爱会来',
    career: '坚持努力，终会成功',
    wealth: '坚持理财，财富渐增',
    health: '坚持锻炼，身体越来越好',
    advice: '坚持就是胜利，不要放弃。',
  },
  {
    id: 39,
    title: '天降大任',
    poem: '天将降大任于斯，必先苦其心志时。\n饿其体肤劳其身，方能担起天下事。',
    fortune: '中吉',
    love: '感情中的考验是成长的机会',
    career: '重任在肩，努力担当',
    wealth: '财富需要努力才能获得',
    health: '注意身体，劳逸结合',
    advice: '接受挑战，承担责任。',
  },
  {
    id: 40,
    title: '心想事成',
    poem: '心想事成万事如意，有求必应遂心愿。\n诚心祈求自有应，善念感通天地间。',
    fortune: '大吉',
    love: '真心相爱，会在一起',
    career: '努力会有回报',
    wealth: '诚心经营，财富自来',
    health: '心态平和，身体健康',
    advice: '保持善念，心想事成。',
  },
  {
    id: 41,
    title: '顺其自然',
    poem: '顺其自然莫强求，瓜熟蒂落水自流。\n万事不可太执着，随缘而行乐无忧。',
    fortune: '中吉',
    love: '感情顺其自然，不必强求',
    career: '工作顺其自然，会有好结果',
    wealth: '财务顺其自然，不要贪心',
    health: '心态平和，身体健康',
    advice: '不要过于执着，顺其自然。',
  },
  {
    id: 42,
    title: '知足常乐',
    poem: '知足常乐心无忧，贪得无厌反添愁。\n粗茶淡饭皆滋味，布衣荆钗亦风流。',
    fortune: '吉',
    love: '珍惜眼前人，知足常乐',
    career: '工作稳定，不必好高骛远',
    wealth: '知足常乐，不要贪心',
    health: '心态平和，身体健康',
    advice: '知足常乐，珍惜拥有。',
  },
  {
    id: 43,
    title: '否极泰来',
    poem: '否极泰来运转好，柳暗花明又一村。\n莫因暂时困顿事，便把平生壮志沉。',
    fortune: '吉',
    love: '困难过后，感情会更好',
    career: '困境将过，好运将至',
    wealth: '财务好转，否极泰来',
    health: '身体康复，更加健康',
    advice: '坚持度过困难，好运将至。',
  },
  {
    id: 44,
    title: '居安思危',
    poem: '居安思危心常备，防微杜渐祸不生。\n莫待临时才抱佛，未雨绸缪万事成。',
    fortune: '中吉',
    love: '感情中要防患于未然',
    career: '工作中要有忧患意识',
    wealth: '理财要谨慎，未雨绸缪',
    health: '注意养生，预防疾病',
    advice: '居安思危，未雨绸缪。',
  },
  {
    id: 45,
    title: '厚积薄发',
    poem: '厚积薄发待时机，蓄势待发冲天际。\n十年磨剑今日试，一朝锋芒震四方。',
    fortune: '吉',
    love: '感情需要慢慢培养',
    career: '积累实力，等待机会',
    wealth: '积蓄力量，等待时机',
    health: '坚持锻炼，增强体质',
    advice: '积累实力，等待时机。',
  },
  {
    id: 46,
    title: '随遇而安',
    poem: '随遇而安心自安，淡泊名利性悠闲。\n粗茶淡饭皆滋味，人生何处不青山。',
    fortune: '中吉',
    love: '感情随缘，不必强求',
    career: '工作随缘，顺其自然',
    wealth: '财务随缘，不要贪心',
    health: '心态平和，身体健康',
    advice: '随遇而安，心态平和。',
  },
  {
    id: 47,
    title: '滴水穿石',
    poem: '滴水穿石非一日，绳锯木断亦有时。\n持之以恒终有成，功到自然在眼前。',
    fortune: '吉',
    love: '感情需要坚持经营',
    career: '工作需要持之以恒',
    wealth: '理财需要长期坚持',
    health: '锻炼需要持之以恒',
    advice: '坚持就是胜利，不要放弃。',
  },
  {
    id: 48,
    title: '峰回路转',
    poem: '峰回路转又一村，柳暗花明见前程。\n莫道前途无知己，天涯何处无芳人。',
    fortune: '吉',
    love: '转机将至，不要放弃希望',
    career: '困境突破，新的方向',
    wealth: '财运好转，否极泰来',
    health: '身体康复，保持乐观',
    advice: '坚持下去，转机将至。',
  },
  {
    id: 49,
    title: '天道酬勤',
    poem: '天道酬勤古来然，一分耕耘一分田。\n莫怨命运多舛错，勤劳双手创家园。',
    fortune: '吉',
    love: '真心付出会有回报',
    career: '努力工作会有成就',
    wealth: '勤劳致富，收入渐增',
    health: '坚持锻炼，身体强健',
    advice: '勤劳努力，天道酬勤。',
  },
  {
    id: 50,
    title: '万事如意',
    poem: '万事如意皆顺心，福禄寿喜满门庭。\n诚心祈求皆应验，善念感通天地灵。',
    fortune: '大吉',
    love: '感情美满，幸福安康',
    career: '事业顺利，万事如意',
    wealth: '财运亨通，富贵荣华',
    health: '身体康健，长寿安康',
    advice: '保持善念，万事如意。',
  },
];

const FortuneBadge = ({ fortune }: { fortune: string }) => {
  const colors: Record<string, string> = {
    大吉: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    吉: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    中吉: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    平: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${colors[fortune] || colors['平']}`}
    >
      {fortune}
    </span>
  );
};

export default function LingsignPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleDraw = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    const sign = LINGQIAN[Math.floor(Math.random() * LINGQIAN.length)];
    setResult(sign);
    setShowDetails(false);
    setLoading(false);
  };

  if (result) {
    return (
      <div className="page-transition">
        <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
            <button
              onClick={() => setResult(null)}
              className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
            >
              <ArrowLeft className="h-4 w-4" /> 重新求签
            </button>
            <h1 className="mb-2 font-serif text-3xl font-bold">📜 求签结果</h1>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="space-y-6">
            {/* 签文 */}
            <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-white p-8 text-center dark:border-amber-800 dark:from-amber-950/30 dark:to-transparent">
              <div className="mb-2 text-6xl">📜</div>
              <div className="mb-1 text-sm text-amber-600">第{result.id}签</div>
              <div className="mb-4 font-serif text-2xl font-bold">{result.title}</div>
              <FortuneBadge fortune={result.fortune} />
              <div className="mt-4 whitespace-pre-line font-serif text-lg leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                {result.poem}
              </div>
            </div>

            {/* 分类解读 */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { icon: Heart, label: '姻缘', content: result.love, color: 'pink' },
                { icon: Briefcase, label: '事业', content: result.career, color: 'blue' },
                { icon: DollarSign, label: '财运', content: result.wealth, color: 'amber' },
                { icon: Stethoscope, label: '健康', content: result.health, color: 'green' },
              ].map(({ icon: Icon, label, content }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-white/[0.03]"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="h-4 w-4 text-[#a3a3a3]" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                    {content}
                  </p>
                </div>
              ))}
            </div>

            {/* 详细解读 */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-3 font-serif text-lg font-bold">📖 签意解读</h3>
              <p className="leading-relaxed text-[#57534e] dark:text-[#a8a29e]">{result.advice}</p>
            </div>

            {/* 综合建议 */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-800 dark:bg-indigo-950/20">
              <h3 className="mb-3 font-serif text-lg font-bold text-indigo-700 dark:text-indigo-300">
                💡 综合建议
              </h3>
              <p className="text-sm leading-relaxed text-[#57534e] dark:text-[#a8a29e]">
                此签为{result.fortune}签，{result.title}。{result.advice}在姻缘方面，{result.love}
                在事业上，{result.career}在财运方面，{result.wealth}在健康方面，{result.health}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="border-b border-black/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-[#737373] hover:text-[#1c1917] dark:text-[#78716c] dark:hover:text-[#e7e5e4]"
          >
            <ArrowLeft className="h-4 w-4" /> 返回首页
          </Link>
          <h1 className="mb-3 font-serif text-3xl font-bold sm:text-4xl">📜 灵签求签</h1>
          <p className="text-[#737373] dark:text-[#78716c]">诚心祈求，抽取灵签，解惑指引</p>
        </div>
      </div>
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-b from-amber-50 to-white p-8 text-center dark:from-amber-950/20 dark:to-transparent">
            <div className="mb-4 text-6xl">🏮</div>
            <p className="text-sm text-[#737373] dark:text-[#78716c]">闭目静心，默念所求之事</p>
            <p className="mt-2 text-xs text-[#a3a3a3]">共50支灵签，涵盖姻缘、事业、财运、健康</p>
          </div>
          <Button
            onClick={handleDraw}
            disabled={loading}
            className="h-12 w-full rounded-xl bg-[#1c1917] text-base font-semibold text-white hover:bg-[#292524] disabled:opacity-50 dark:bg-[#e7e5e4] dark:text-[#1c1917]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 求签中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ScrollText className="h-4 w-4" /> 诚心求签
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
