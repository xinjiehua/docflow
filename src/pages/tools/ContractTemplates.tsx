import { useState, useRef } from 'react'
import { FileText, Download, Eye, Copy, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import ToolLayout from '@/components/tools/ToolLayout'
import FileUploader from '@/components/tools/FileUploader'
import ProcessingIndicator from '@/components/tools/ProcessingIndicator'
import { useUsageStore } from '@/stores/usage'
import { useUserStore } from '@/stores/user'

const templates = [
  {
    id: 'employment',
    name: '劳动合同',
    desc: '标准劳动合同模板，含薪资、试用期、社保条款',
    category: '人事',
  },
  {
    id: 'lease',
    name: '房屋租赁合同',
    desc: '房屋租赁协议，含租金、押金、维修责任',
    category: '民事',
  },
  {
    id: 'nda',
    name: '保密协议 (NDA)',
    desc: '商业保密协议，含保密范围、期限、违约责任',
    category: '商业',
  },
  {
    id: 'service',
    name: '服务合同',
    desc: '服务外包协议，含服务内容、交付标准、付款方式',
    category: '商业',
  },
  {
    id: 'purchase',
    name: '采购合同',
    desc: '商品采购协议，含规格、数量、验收标准',
    category: '商业',
  },
  {
    id: 'loan',
    name: '借款合同',
    desc: '个人/企业借款协议，含利息、还款方式、担保',
    category: '民事',
  },
  {
    id: 'agency',
    name: '委托代理合同',
    desc: '委托代理协议，含代理范围、权限、报酬',
    category: '商业',
  },
  {
    id: 'partnership',
    name: '合伙协议',
    desc: '合伙经营协议，含出资比例、利润分配、退出机制',
    category: '商业',
  },
]

function getTemplateContent(id: string, formData: Record<string, string>): string {
  const f = (key: string) => formData[key] || `[${key}]`
  const date = new Date().toLocaleDateString('zh-CN')

  const contents: Record<string, string> = {
    employment: `劳动合同

甲方（用人单位）：${f('companyName')}
统一社会信用代码：${f('creditCode')}
法定代表人：${f('legalPerson')}
地址：${f('companyAddress')}

乙方（劳动者）：${f('employeeName')}
身份证号：${f('idNumber')}
联系电话：${f('phone')}
住址：${f('employeeAddress')}

根据《中华人民共和国劳动法》及相关法律法规，甲乙双方在平等自愿、协商一致的基础上，签订本劳动合同。

第一条 合同期限
本合同为 ${f('contractType')} 合同，自 ${f('startDate')} 起至 ${f('endDate')} 止。其中试用期 ${f('probationMonths')} 个月。

第二条 工作内容与工作地点
乙方同意在甲方 ${f('department')} 部门担任 ${f('position')} 职务。
工作地点：${f('workplace')}

第三条 工作时间与休息休假
实行标准工时制度，每日工作8小时，每周工作40小时。
甲方应当保证乙方每周至少休息一日。

第四条 劳动报酬
乙方试用期工资为每月人民币 ${f('probationSalary')} 元（税前）。
转正后工资为每月人民币 ${f('salary')} 元（税前）。
甲方于每月 ${f('payDay')} 日前支付上月工资。

第五条 社会保险与福利待遇
甲方依法为乙方办理社会保险（养老、医疗、失业、工伤、生育），并缴纳住房公积金。
其他福利待遇按甲方相关规定执行。

第六条 劳动保护与工作条件
甲方为乙方提供符合国家规定的劳动安全卫生条件和必要的劳动防护用品。

第七条 合同变更、解除与终止
经甲乙双方协商一致，可以变更本合同。
在合同履行过程中发生争议的，双方应协商解决；协商不成的，可向劳动争议仲裁委员会申请仲裁。

第八条 其他约定
${f('otherTerms')}

本合同一式两份，甲乙双方各执一份，具有同等法律效力。

甲方（盖章）：                      乙方（签字）：

法定代表人/授权代表：

签订日期：${date}

---

声明：本模板仅供参考，具体条款请根据实际情况调整，建议在签署前咨询专业律师。`,

    lease: `房屋租赁合同

出租方（甲方）：${f('landlordName')}
身份证号：${f('landlordId')}
联系电话：${f('landlordPhone')}
住址：${f('landlordAddress')}

承租方（乙方）：${f('tenantName')}
身份证号：${f('tenantId')}
联系电话：${f('tenantPhone')}

根据《中华人民共和国合同法》及相关法律法规，甲乙双方经协商一致，签订本房屋租赁合同。

第一条 房屋基本情况
房屋坐落：${f('houseAddress')}
建筑面积：${f('area')} 平方米
房屋用途：${f('usage')}
房屋内附属设施及物品：${f('facilities')}

第二条 租赁期限
租赁期限自 ${f('startDate')} 至 ${f('endDate')}，共计 ${f('months')} 个月。

第三条 租金及支付方式
月租金为人民币 ${f('rent')} 元。
支付方式：${f('paymentMethod')}
押金：人民币 ${f('deposit')} 元，于入住前一次性支付。

第四条 房屋维修
租赁期间，房屋及其附属设施的自然损耗由甲方负责维修。
乙方人为损坏的，由乙方负责修复或赔偿。

第五条 其他约定
${f('otherTerms')}

甲方（签字）：                      乙方（签字）：

签订日期：${date}

---

声明：本模板仅供参考，建议签署前咨询专业律师。`,

    nda: `保密协议（NDA）

甲方（披露方）：${f('partyA')}
地址：${f('partyAAddress')}
法定代表人：${f('partyALegal')}

乙方（接收方）：${f('partyB')}
地址：${f('partyBAddress')}
法定代表人：${f('partyBLegal')}

鉴于甲乙双方拟进行 ${f('purpose')} 的合作/交易，为保护双方合法权益，签订本保密协议。

第一条 保密信息范围
本协议所称保密信息包括但不限于：
1. 技术、商业、财务等商业秘密
2. 客户资料、供应商信息
3. 经营策略、发展规划
4. 未公开的专利、商标等知识产权信息
5. 其他经双方确认的保密信息

第二条 保密义务
乙方应对甲方披露的保密信息严格保密，不得向第三方披露、泄露或传播。
保密义务不适用于以下情况：
1. 已公开或合法成为公开信息
2. 从合法渠道获得的非保密信息
3. 法律法规要求披露的信息

第三条 保密期限
保密期限为自本协议签署之日起 ${f('years')} 年。

第四条 违约责任
任何一方违反本协议，应赔偿对方因此遭受的全部损失。

第五条 争议解决
因本协议引起的争议，双方应协商解决；协商不成的，提交 ${f('jurisdiction')} 仲裁。

甲方（盖章）：                      乙方（盖章）：

法定代表人/授权代表：              法定代表人/授权代表：

签订日期：${date}

---

声明：本模板仅供参考，建议签署前咨询专业律师。`,

    service: `服务合同

甲方（委托方）：${f('partyA')}
地址：${f('partyAAddress')}
联系电话：${f('partyAPhone')}

乙方（服务方）：${f('partyB')}
地址：${f('partyBAddress')}
联系电话：${f('partyBPhone')}

根据《中华人民共和国合同法》及相关法律法规，甲乙双方经友好协商，签订本服务合同。

第一条 服务内容
乙方为甲方提供以下服务：
${f('serviceContent')}

第二条 服务标准
乙方应按照以下标准提供服务：
${f('serviceStandard')}

第三条 服务期限
服务期限自 ${f('startDate')} 至 ${f('endDate')}。

第四条 服务费用及支付
服务费用总计人民币 ${f('totalFee')} 元。
支付方式：${f('paymentMethod')}
付款时间：${f('paymentSchedule')}

第五条 双方权利义务
甲方应及时提供开展服务所需的必要条件和资料。
乙方应按时、按质完成服务内容。

第六条 违约责任
任何一方违反本合同约定，应承担违约责任并赔偿对方损失。

第七条 争议解决
因本合同引起的争议，双方协商解决；协商不成，提交 ${f('jurisdiction')} 仲裁。

甲方（盖章）：                      乙方（盖章）：

法定代表人/授权代表：              法定代表人/授权代表：

签订日期：${date}

---

声明：本模板仅供参考，建议签署前咨询专业律师。`,

    purchase: `采购合同

买方（甲方）：${f('partyA')}
地址：${f('partyAAddress')}
联系人：${f('partyAContact')}

卖方（乙方）：${f('partyB')}
地址：${f('partyBAddress')}
联系人：${f('partyBContact')}

根据《中华人民共和国合同法》及相关法律法规，甲乙双方经协商一致，签订本采购合同。

第一条 采购商品
商品名称：${f('productName')}
规格型号：${f('specifications')}
数量：${f('quantity')}
单价：${f('unitPrice')} 元/单位
总价：${f('totalPrice')} 元

第二条 质量标准
商品应符合国家相关质量标准和甲方技术要求。

第三条 交付方式与时间
交付时间：${f('deliveryDate')}
交付地点：${f('deliveryPlace')}
运输方式：${f('shippingMethod')}
运输费用由 ${f('shippingPayer')} 承担。

第四条 验收
甲方应在收到商品后 ${f('inspectionDays')} 个工作日内完成验收。
验收合格后签发验收报告。

第五条 付款方式
付款方式：${f('paymentMethod')}
付款时间：${f('paymentSchedule')}

第六条 售后服务
质保期：${f('warrantyPeriod')}
质保期内因质量问题，乙方应免费维修或更换。

第七条 违约责任
${f('breachTerms')}

甲方（盖章）：                      乙方（盖章）：

法定代表人/授权代表：              法定代表人/授权代表：

签订日期：${date}

---

声明：本模板仅供参考，建议签署前咨询专业律师。`,

    loan: `借款合同

出借方（甲方）：${f('lenderName')}
身份证号：${f('lenderId')}
联系电话：${f('lenderPhone')}

借款方（乙方）：${f('borrowerName')}
身份证号：${f('borrowerId')}
联系电话：${f('borrowerPhone')}

根据《中华人民共和国合同法》及相关法律法规，甲乙双方经协商一致，签订本借款合同。

第一条 借款金额
甲方向乙方借款人民币 ${f('amount')} 元（大写：${f('amountChinese')}）。

第二条 借款期限
借款期限自 ${f('startDate')} 至 ${f('endDate')}，共计 ${f('months')} 个月。

第三条 利率与利息
借款年利率为 ${f('interestRate')}%。
利息计算方式：${f('interestCalculation')}

第四条 还款方式
还款方式：${f('repaymentMethod')}
还款日：每月 ${f('repaymentDay')} 日

第五条 担保方式
${f('guarantee')}

第六条 违约责任
乙方逾期还款的，按逾期金额每日 ${f('penaltyRate')}% 支付违约金。

第七条 争议解决
因本合同引起的争议，双方协商解决；协商不成，提交 ${f('jurisdiction')} 法院诉讼。

甲方（签字）：                      乙方（签字）：

签订日期：${date}

---

声明：本模板仅供参考，建议签署前咨询专业律师。`,

    agency: `委托代理合同

委托方（甲方）：${f('partyA')}
地址：${f('partyAAddress')}
法定代表人：${f('partyALegal')}
联系电话：${f('partyAPhone')}

受托方（乙方）：${f('partyB')}
地址：${f('partyBAddress')}
法定代表人：${f('partyBLegal')}
联系电话：${f('partyBPhone')}

根据《中华人民共和国合同法》及相关法律法规，甲乙双方经协商一致，签订本委托代理合同。

第一条 委托事项
甲方委托乙方办理以下事项：
${f('commissionContent')}

第二条 委托权限
乙方在 ${f('authorityScope')} 范围内处理委托事项。

第三条 办理期限
自 ${f('startDate')} 至 ${f('endDate')}。

第四条 报酬及支付
委托报酬：人民币 ${f('commission')} 元。
支付方式：${f('paymentMethod')}
支付时间：${f('paymentSchedule')}

第五条 双方权利义务
甲方应提供委托事项所需的全部资料和必要的协助。
乙方应勤勉尽责，维护甲方的合法权益。

第六条 保密义务
乙方对在办理委托事项中知悉的甲方商业秘密和个人信息负有保密义务。

第七条 违约责任
${f('breachTerms')}

甲方（盖章）：                      乙方（盖章）：

法定代表人/授权代表：              法定代表人/授权代表：

签订日期：${date}

---

声明：本模板仅供参考，建议签署前咨询专业律师。`,

    partnership: `合伙协议

甲方：${f('partyAName')}
身份证号：${f('partyAId')}
出资比例：${f('partyAShare')}%

乙方：${f('partyBName')}
身份证号：${f('partyBId')}
出资比例：${f('partyBShare')}%

根据《中华人民共和国合伙企业法》及相关法律法规，甲乙双方经协商一致，签订本合伙协议。

第一条 合伙企业名称及经营范围
企业名称：${f('businessName')}
经营范围：${f('businessScope')}
经营地址：${f('businessAddress')}

第二条 出资
甲方出资：人民币 ${f('partyACapital')} 元，出资方式：${f('partyAMethod')}
乙方出资：人民币 ${f('partyBCapital')} 元，出资方式：${f('partyBMethod')}
出资总额：人民币 ${f('totalCapital')} 元

第三条 利润分配与亏损分担
利润按出资比例分配，即甲方 ${f('partyAShare')}%，乙方 ${f('partyBShare')}%。
亏损按相同比例分担。

第四条 经营管理
${f('management')} 负责合伙企业的日常经营管理。
重大事项须经全体合伙人一致同意。

第五条 合伙期限
合伙期限自 ${f('startDate')} 至 ${f('endDate')}。

第六条 入伙与退伙
新合伙人入伙须经全体合伙人一致同意。
合伙人退伙应提前 ${f('noticeMonths')} 个月通知其他合伙人。

第七条 争议解决
因本协议引起的争议，双方协商解决；协商不成，提交 ${f('jurisdiction')} 仲裁。

甲方（签字）：                      乙方（签字）：

签订日期：${date}

---

声明：本模板仅供参考，建议签署前咨询专业律师。`,
  }

  return contents[id] || '模板内容加载失败'
}

const formFields: Record<string, { key: string; label: string; placeholder: string }[]> = {
  employment: [
    { key: 'companyName', label: '公司名称', placeholder: 'XX有限公司' },
    { key: 'creditCode', label: '统一社会信用代码', placeholder: '91XXXXXXXXXX' },
    { key: 'legalPerson', label: '法定代表人', placeholder: '张三' },
    { key: 'companyAddress', label: '公司地址', placeholder: 'XX市XX区XX路XX号' },
    { key: 'employeeName', label: '员工姓名', placeholder: '李四' },
    { key: 'idNumber', label: '身份证号', placeholder: '' },
    { key: 'phone', label: '联系电话', placeholder: '' },
    { key: 'employeeAddress', label: '员工住址', placeholder: '' },
    { key: 'contractType', label: '合同类型', placeholder: '固定期限/无固定期限/以完成一定工作为期限' },
    { key: 'startDate', label: '合同开始日期', placeholder: '2024-01-01' },
    { key: 'endDate', label: '合同结束日期', placeholder: '2026-12-31' },
    { key: 'probationMonths', label: '试用期（月）', placeholder: '3' },
    { key: 'department', label: '部门', placeholder: '技术部' },
    { key: 'position', label: '职位', placeholder: '软件工程师' },
    { key: 'workplace', label: '工作地点', placeholder: '' },
    { key: 'probationSalary', label: '试用期工资（元/月）', placeholder: '8000' },
    { key: 'salary', label: '转正工资（元/月）', placeholder: '10000' },
    { key: 'payDay', label: '发薪日', placeholder: '15' },
    { key: 'otherTerms', label: '其他约定', placeholder: '（选填）' },
  ],
  lease: [
    { key: 'landlordName', label: '出租方姓名', placeholder: '' },
    { key: 'landlordId', label: '出租方身份证号', placeholder: '' },
    { key: 'landlordPhone', label: '出租方电话', placeholder: '' },
    { key: 'landlordAddress', label: '出租方住址', placeholder: '' },
    { key: 'tenantName', label: '承租方姓名', placeholder: '' },
    { key: 'tenantId', label: '承租方身份证号', placeholder: '' },
    { key: 'tenantPhone', label: '承租方电话', placeholder: '' },
    { key: 'houseAddress', label: '房屋地址', placeholder: '' },
    { key: 'area', label: '建筑面积（m²）', placeholder: '100' },
    { key: 'usage', label: '房屋用途', placeholder: '居住/办公' },
    { key: 'facilities', label: '附属设施物品', placeholder: '空调、冰箱、洗衣机...' },
    { key: 'startDate', label: '租赁开始日期', placeholder: '2024-01-01' },
    { key: 'endDate', label: '租赁结束日期', placeholder: '2024-12-31' },
    { key: 'months', label: '租赁月数', placeholder: '12' },
    { key: 'rent', label: '月租金（元）', placeholder: '3000' },
    { key: 'paymentMethod', label: '支付方式', placeholder: '月付/季付/年付' },
    { key: 'deposit', label: '押金（元）', placeholder: '6000' },
    { key: 'otherTerms', label: '其他约定', placeholder: '' },
  ],
  nda: [
    { key: 'partyA', label: '甲方名称', placeholder: '' },
    { key: 'partyAAddress', label: '甲方地址', placeholder: '' },
    { key: 'partyALegal', label: '甲方法定代表人', placeholder: '' },
    { key: 'partyB', label: '乙方名称', placeholder: '' },
    { key: 'partyBAddress', label: '乙方地址', placeholder: '' },
    { key: 'partyBLegal', label: '乙方法定代表人', placeholder: '' },
    { key: 'purpose', label: '合作目的', placeholder: '' },
    { key: 'years', label: '保密期限（年）', placeholder: '3' },
    { key: 'jurisdiction', label: '仲裁机构', placeholder: 'XX市仲裁委员会' },
  ],
  service: [
    { key: 'partyA', label: '委托方名称', placeholder: '' },
    { key: 'partyAAddress', label: '委托方地址', placeholder: '' },
    { key: 'partyAPhone', label: '委托方电话', placeholder: '' },
    { key: 'partyB', label: '服务方名称', placeholder: '' },
    { key: 'partyBAddress', label: '服务方地址', placeholder: '' },
    { key: 'partyBPhone', label: '服务方电话', placeholder: '' },
    { key: 'serviceContent', label: '服务内容', placeholder: '详细描述...' },
    { key: 'serviceStandard', label: '服务标准', placeholder: '' },
    { key: 'startDate', label: '开始日期', placeholder: '' },
    { key: 'endDate', label: '结束日期', placeholder: '' },
    { key: 'totalFee', label: '总费用（元）', placeholder: '' },
    { key: 'paymentMethod', label: '支付方式', placeholder: '' },
    { key: 'paymentSchedule', label: '付款时间', placeholder: '' },
    { key: 'jurisdiction', label: '仲裁机构', placeholder: '' },
  ],
  purchase: [
    { key: 'partyA', label: '买方名称', placeholder: '' },
    { key: 'partyAAddress', label: '买方地址', placeholder: '' },
    { key: 'partyAContact', label: '买方联系人', placeholder: '' },
    { key: 'partyB', label: '卖方名称', placeholder: '' },
    { key: 'partyBAddress', label: '卖方地址', placeholder: '' },
    { key: 'partyBContact', label: '卖方联系人', placeholder: '' },
    { key: 'productName', label: '商品名称', placeholder: '' },
    { key: 'specifications', label: '规格型号', placeholder: '' },
    { key: 'quantity', label: '数量', placeholder: '' },
    { key: 'unitPrice', label: '单价', placeholder: '' },
    { key: 'totalPrice', label: '总价', placeholder: '' },
    { key: 'deliveryDate', label: '交付日期', placeholder: '' },
    { key: 'deliveryPlace', label: '交付地点', placeholder: '' },
    { key: 'shippingMethod', label: '运输方式', placeholder: '' },
    { key: 'shippingPayer', label: '运费承担方', placeholder: '甲方/乙方' },
    { key: 'inspectionDays', label: '验收天数', placeholder: '7' },
    { key: 'paymentMethod', label: '付款方式', placeholder: '' },
    { key: 'paymentSchedule', label: '付款时间', placeholder: '' },
    { key: 'warrantyPeriod', label: '质保期', placeholder: '12个月' },
    { key: 'breachTerms', label: '违约条款', placeholder: '' },
  ],
  loan: [
    { key: 'lenderName', label: '出借方姓名', placeholder: '' },
    { key: 'lenderId', label: '出借方身份证号', placeholder: '' },
    { key: 'lenderPhone', label: '出借方电话', placeholder: '' },
    { key: 'borrowerName', label: '借款方姓名', placeholder: '' },
    { key: 'borrowerId', label: '借款方身份证号', placeholder: '' },
    { key: 'borrowerPhone', label: '借款方电话', placeholder: '' },
    { key: 'amount', label: '借款金额（元）', placeholder: '100000' },
    { key: 'amountChinese', label: '大写金额', placeholder: '壹拾万元整' },
    { key: 'startDate', label: '借款开始日期', placeholder: '' },
    { key: 'endDate', label: '借款结束日期', placeholder: '' },
    { key: 'months', label: '借款月数', placeholder: '12' },
    { key: 'interestRate', label: '年利率（%）', placeholder: '5' },
    { key: 'interestCalculation', label: '利息计算方式', placeholder: '按月计息/到期一次还本付息' },
    { key: 'repaymentMethod', label: '还款方式', placeholder: '等额本息/等额本金/到期一次还款' },
    { key: 'repaymentDay', label: '还款日', placeholder: '15' },
    { key: 'guarantee', label: '担保方式', placeholder: '无担保/抵押/质押/保证人' },
    { key: 'penaltyRate', label: '逾期违约金日利率（%）', placeholder: '0.05' },
    { key: 'jurisdiction', label: '管辖法院', placeholder: '' },
  ],
  agency: [
    { key: 'partyA', label: '委托方名称', placeholder: '' },
    { key: 'partyAAddress', label: '委托方地址', placeholder: '' },
    { key: 'partyALegal', label: '委托方法定代表人', placeholder: '' },
    { key: 'partyAPhone', label: '委托方电话', placeholder: '' },
    { key: 'partyB', label: '受托方名称', placeholder: '' },
    { key: 'partyBAddress', label: '受托方地址', placeholder: '' },
    { key: 'partyBLegal', label: '受托方法定代表人', placeholder: '' },
    { key: 'partyBPhone', label: '受托方电话', placeholder: '' },
    { key: 'commissionContent', label: '委托事项', placeholder: '' },
    { key: 'authorityScope', label: '授权范围', placeholder: '' },
    { key: 'startDate', label: '开始日期', placeholder: '' },
    { key: 'endDate', label: '结束日期', placeholder: '' },
    { key: 'commission', label: '委托报酬（元）', placeholder: '' },
    { key: 'paymentMethod', label: '支付方式', placeholder: '' },
    { key: 'paymentSchedule', label: '支付时间', placeholder: '' },
    { key: 'breachTerms', label: '违约条款', placeholder: '' },
  ],
  partnership: [
    { key: 'partyAName', label: '甲方姓名', placeholder: '' },
    { key: 'partyAId', label: '甲方身份证号', placeholder: '' },
    { key: 'partyAShare', label: '甲方出资比例（%）', placeholder: '60' },
    { key: 'partyBName', label: '乙方姓名', placeholder: '' },
    { key: 'partyBId', label: '乙方身份证号', placeholder: '' },
    { key: 'partyBShare', label: '乙方出资比例（%）', placeholder: '40' },
    { key: 'businessName', label: '企业名称', placeholder: '' },
    { key: 'businessScope', label: '经营范围', placeholder: '' },
    { key: 'businessAddress', label: '经营地址', placeholder: '' },
    { key: 'partyACapital', label: '甲方出资额（元）', placeholder: '' },
    { key: 'partyAMethod', label: '甲方出资方式', placeholder: '现金/实物/技术' },
    { key: 'partyBCapital', label: '乙方出资额（元）', placeholder: '' },
    { key: 'partyBMethod', label: '乙方出资方式', placeholder: '' },
    { key: 'totalCapital', label: '出资总额（元）', placeholder: '' },
    { key: 'management', label: '经营管理人', placeholder: '' },
    { key: 'startDate', label: '开始日期', placeholder: '' },
    { key: 'endDate', label: '结束日期', placeholder: '' },
    { key: 'noticeMonths', label: '退伙通知月数', placeholder: '3' },
    { key: 'jurisdiction', label: '仲裁机构', placeholder: '' },
  ],
}

export default function ContractTemplates() {
  const { isPro, checkUsage } = useUserStore()
  const { used, limit } = useUsageStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  const [processing, setProcessing] = useState(false)
  const previewRef = useRef<HTMLPreElement>(null)

  const handleSelect = (id: string) => {
    setSelected(id)
    setFormData({})
    setPreview(false)
    setCopied(false)
  }

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleGenerate = () => {
    if (!selected || !checkUsage()) return
    setProcessing(true)
    setTimeout(() => {
      setPreview(true)
      setProcessing(false)
    }, 500)
  }

  const handleCopy = async () => {
    if (!selected) return
    const content = getTemplateContent(selected, formData)
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadTxt = () => {
    if (!selected) return
    const content = getTemplateContent(selected, formData)
    const tpl = templates.find((t) => t.id === selected)!
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tpl.name}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadHtml = () => {
    if (!selected) return
    const content = getTemplateContent(selected, formData)
    const tpl = templates.find((t) => t.id === selected)!
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${tpl.name}</title>
<style>
body { font-family: 'SimSun', serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 2; color: #333; }
h1 { text-align: center; font-size: 24px; margin-bottom: 40px; }
p { text-indent: 2em; margin: 8px 0; }
.signature { margin-top: 60px; display: flex; justify-content: space-between; }
.disclaimer { margin-top: 40px; padding: 10px; background: #f5f5f5; font-size: 12px; color: #999; text-align: center; text-indent: 0; }
</style>
</head>
<body>
<h1>${tpl.name}</h1>
${content.split('\n').map(line => {
  const trimmed = line.trim()
  if (!trimmed) return '<br/>'
  if (trimmed === '---') return '<hr/>'
  if (trimmed.startsWith('声明')) return `<p class="disclaimer">${trimmed}</p>`
  return `<p>${trimmed}</p>`
}).join('\n')}
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tpl.name}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentFields = selected ? formFields[selected] || [] : []

  return (
    <ToolLayout
      title="合同模板"
      description="快速生成常用合同模板，填写关键信息自动生成合同文本"
    >
      {!isPro() && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          今日已使用 {used}/{limit} 次，<Link to="/pricing" className="underline">升级专业版</Link> 无限使用
        </div>
      )}

      {!selected ? (
        <div>
          <h3 className="text-lg font-medium text-navy-700 mb-4">选择合同模板</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleSelect(tpl.id)}
                className="card text-left hover:border-brand-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-navy-700">{tpl.name}</h4>
                    <p className="text-sm text-navy-400 mt-1">{tpl.desc}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-navy-50 text-navy-500">{tpl.category}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => { setSelected(null); setPreview(false); }}
            className="text-sm text-brand-600 hover:text-brand-700 mb-6"
          >
            &larr; 返回模板列表
          </button>

          <h3 className="text-lg font-medium text-navy-700 mb-4">
            {templates.find((t) => t.id === selected)?.name} - 填写信息
          </h3>

          {!preview ? (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                {currentFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-navy-600 mb-1">{field.label}</label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="input"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={handleGenerate} className="btn-primary" disabled={processing}>
                  {processing ? '生成中...' : '预览合同'}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="card !p-6 max-h-[500px] overflow-y-auto">
                <pre ref={previewRef} className="whitespace-pre-wrap font-sans text-sm text-navy-700 leading-relaxed">
                  {getTemplateContent(selected, formData)}
                </pre>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={handleCopy} className="btn-secondary">
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? '已复制' : '复制文本'}
                </button>
                <button onClick={handleDownloadTxt} className="btn-secondary">
                  <Download className="w-4 h-4 mr-1" />
                  下载 TXT
                </button>
                <button onClick={handleDownloadHtml} className="btn-secondary">
                  <Download className="w-4 h-4 mr-1" />
                  下载 HTML
                </button>
                <button onClick={() => setPreview(false)} className="btn-secondary">
                  返回编辑
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
