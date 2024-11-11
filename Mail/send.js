const { mailOptions, transporter } = require('../config/index.js');
const fs = require('fs');
const path = require('path');

const SendMailService = async (array) => {
    let target = '';
    let Platform = '';
    let Impact = '';
    let Compliance = '';
    let Period = '';
    let ApprovedBy = '';
    if (array.jobDetails[7]) {
        const { 'agency': agency, 'client': client, 'otherTg': other } = array.jobDetails[7];
        if (agency || client || other) {
            target = [
                agency ? `หน่วยงาน ${agency}` : '',
                client ? `ลูกค้า ${client}` : '',
                other ? `อื่นๆ ${other}` : ''
            ].filter(Boolean).join(', ');
        }
    }
    if (array.jobDetails[8]) {
        const { mobile, web, other } = array.jobDetails[8];
        if (mobile || web || other) {
            Platform = [
                mobile ? 'Mobile Application' : '',
                web ? 'Web Application' : '',
                other ? `other: ${other}` : ''
            ].filter(Boolean).join(', ');
        }
    }
    if (array.jobDetails[10]) {
        const { efficiency, effective, main, notmain } = array.jobDetails[10];
        if (efficiency || effective || main || notmain) {
            Impact = [
                efficiency ? 'ประสิทธิภาพ' : '',
                effective ? 'ประสิทธิผล' : '',
                main ? `กระบวนการหลัก ${main}` : '',
                notmain ? `ไม่ใช่กระบวนการหลัก ${notmain}` : ''
            ].filter(Boolean).join(', ');
        }
    }
    if (array.jobDetails[11]) {
        const { law, notlaw, lawother, docother } = array.jobDetails[11];
        if (law || notlaw || lawother || docother) {
            Compliance = [
                law ? 'เกี่ยวข้องกับกฏหมาย' : '',
                notlaw ? 'ไม่เกี่ยวข้องกับกฏหมาย' : '',
                lawother ? `เกี่ยวข้องกับกฏอื่นๆ ${lawother}` : '',
                docother ? `เอกสารที่เกี่ยวข้อง (เอกสาร P/WI) ${docother}` : ''
            ].filter(Boolean).join(', ');
        }
    }
    if (array.jobDetails[12]) {
        if (!array.jobDetails[12]) return '';
        if (array.jobDetails[12]['6month']) {
            Period = '6 เดือน'
        } else if (array.jobDetails[12]['1year']) {
            Period = '1 ปี';
        } else if (array.jobDetails[12]['2year']) {
            Period = '2 ปี';
        } else if (array.jobDetails[12]['mt2year']) {
            Period = 'มากกว่า 2 ปี';
        }
    }

    if (array.jobDetails[16]) {
        const { section, depart, moc, other } = array.jobDetails[16];
        if (section || depart || moc || other) {
            ApprovedBy = [
                section ? `ระดับส่วน` : '',
                depart ? `ระดับฝ่าย` : '',
                moc ? `Moc` : '',
                other ? `อื่นๆ ${other}` : ''
            ].filter(Boolean).join(', ');
        }
    }
    
    const formattedString = array.jobDetails[17]
        .map((item, index) => `${index + 1}. ระบบที่ใช้ ${item.systemName} ข้อมูลที่ใช้ ${item.dataUsed} เจ้าของระบบ ${item.owner}`)
        .join('<br/>'); // Join each formatted string with a new line


    const action = array.action === 'Approved' ? 'ได้รับการอนุมัติเรียบร้อยแล้ว' :
        array.action === 'Rejected' ? 'ถูกปฏิเสธ' : null;
    const attachments = path.join(__dirname, `../../tso-aov-sr-uploads/${array.fileName}`);
    const attachments1 = path.join(__dirname, `../../tso-aov-sr-uploads/${array.fileName1}`);
    const reviwedBy = array.reviewBy ? 'reviewed by คุณ' + array.reviewBy : '';
    if (array.action === 'Send') {
        const emailTemplateSent = fs.readFileSync(path.join(__dirname, '../html/sentMail.html'), 'utf8');
        const emailBodySent = emailTemplateSent
            .replace('{{NameApprover}}', array.NameApprover)
            .replace('{{jobName}}', array.jobDetails[0])
            .replace('{{jobName1}}', array.jobDetails[0])
            .replace('{{jobDetails}}', array.jobDetails[1])
            .replace('{{requesterName}}', array.requesterName)
            .replace('{{department}}', array.jobDetails[2])
            .replace('{{target}}', target)
            .replace('{{workType}}', array.jobDetails[5])
            .replace('{{Platform}}', Platform)
            .replace('{{natureOfWork}}', array.jobDetails[6])
            .replace('{{benefits}}', array.jobDetails[4])
            .replace('{{objectives}}', array.jobDetails[3])
            .replace('{{Impact}}', Impact)
            .replace('{{Compliance}}', Compliance)
            .replace('{{Period}}', Period)
            .replace('{{ApprovedBy}}', ApprovedBy)
            .replace('{{budget}}', array.jobDetails[14] + ' บาท')
            .replace('{{budgetUsed}}', array.jobDetails[15])
            .replace('{{connecterRequest}}', formattedString);
        return await ActionSend(array, emailBodySent, attachments, attachments1, reviwedBy);
    } else if (array.action === 'Approved' || array.action === 'Rejected') {
        const emailTemplateAction = fs.readFileSync(path.join(__dirname, '../html/Action.html'), 'utf8');
        const emailBodyAction = emailTemplateAction
            .replace('{{NameApprover}}', array.NameApprover)
            .replace('{{requesterName}}', array.requesterName)
            .replace('{{jobName}}', array.jobDetails[0])
            .replace('{{jobName1}}', array.jobDetails[0])
            .replace('{{jobDetails}}', array.jobDetails[1])
            .replace('{{requesterName1}}', array.requesterName)
            .replace('{{department}}', array.jobDetails[2])
            .replace('{{target}}', target)
            .replace('{{workType}}', array.jobDetails[5])
            .replace('{{Platform}}', Platform)
            .replace('{{natureOfWork}}', array.jobDetails[6])
            .replace('{{benefits}}', array.jobDetails[4])
            .replace('{{objectives}}', array.jobDetails[3])
            .replace('{{action}}', action)
            .replace('{{comments}}', array.comments)
            .replace('{{Impact}}', Impact)
            .replace('{{Compliance}}', Compliance)
            .replace('{{Period}}', Period)
            .replace('{{ApprovedBy}}', ApprovedBy)
            .replace('{{budget}}', array.jobDetails[14] + ' บาท')
            .replace('{{budgetUsed}}', array.jobDetails[15])
            .replace('{{connecterRequest}}', formattedString);
        return await ActionSend(array, emailBodyAction, attachments, attachments1, array.action);
    } else {
        return 'Action is Undefined.'
    }
}

const ActionSend = async (array, emailBodySent, attachments, attachments1, header) => {
    transporter.sendMail(await mailOptions(array, emailBodySent, [
        { filename: array.jobDetails[9], path: attachments },
        { filename: array.jobDetails[13], path: attachments1 }
    ], header), (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log(info.response);
        }
    })
}
module.exports = { SendMailService }