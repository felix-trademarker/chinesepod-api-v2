let Lessons = require('../repositories/lessons')
let LessonsVocabulary = require('../repositories/lessonVocabulary')
// var ModelRedis = require('../repositories/_modelRedis')
// let redisClientVocab = new ModelRedis('vocab')
let _ = require('lodash')
const { asyncForEach } = require('../frequent')


exports.fn = async function(req, res, next) {
  
  let userId = req.session.userId
  let inputs = req.session.inputs

  let queryAddOn = []
  
  if (inputs && inputs.limit) {
    queryAddOn.push("LIMIT " + inputs.limit)
  }
  if (inputs && inputs.skip) {
    queryAddOn.push("OFFSET " + inputs.skip)
  }

  if (!userId) {
    res.json({err:'Invalid'})
  } else {

    let lessonData;
    if (inputs.id) {
      lessonData = await Lessons
        .findOne(inputs.id)
        .select(['title', 'image', 'level', 'type', 'hash_code', 'introduction', 'publication_timestamp', 'hosts']);
    } else {
      lessonData = await Lessons
        .findOne({slug: encodeURI(inputs.slug)})
        .select(['title', 'image', 'level', 'type', 'hash_code', 'introduction', 'publication_timestamp', 'hosts']);
    }

    if (!lessonData) {
      throw 'invalid'
    }

    const convert = require('pinyin-tone-converter');

    const sanitizeHtml = require('sanitize-html');

    const sanitizeOptions = {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'image'],
      allowedAttributes: {
        a: [ 'href', 'name', 'target'],
        image: ['src', 'alt', 'width', 'height'],
      }
    };

    let lessonRoot = `https://s3contents.chinesepod.com/${lessonData.type === 'extra' ? 'extra/' : ''}${lessonData.id}/${lessonData.hash_code}/`

    lessonData.introduction = sanitizeHtml(lessonData.introduction, sanitizeOptions);
    lessonData.image = lessonData.image && lessonData.image.slice(0,4) === 'http' ? lessonData.image : lessonRoot + lessonData.image;

    lessonData.image.replace('http:', 'https:');
    lessonData.image.replace('https://s3.amazonaws.com/chinesepod.com/', 'https://s3contents.chinesepod.com/');

    const keyMap = {
      column_1: 's',
      column_2: 'p',
      column_3: 'en',
      column_4: 't'
    };

    let vocab = await Vocabulary.find({
      v3_id: lessonData.id,
      vocabulary_class: {
        in: ['Key Vocabulary', 'Supplementary']
      }
    })
      .sort([
        {vocabulary_class: 'ASC'},
        {display_order: 'ASC'}
      ]).limit(4);
    let vocabData = [];
    _.each(vocab, function (item) {
      item['simplified'] = item.column_1;
      item['pinyin'] = convert.convertPinyinTones(item.column_2);
      item['english'] = item.column_3;
      item['traditional'] = item.column_4;
      item['audioUrl'] = lessonRoot + item.audio
      vocabData.push(_.pick(item, ['simplified', 'traditional', 'pinyin', 'english', 'audioUrl']));
    });

    let rawDialogues = await ContentDialogues.find({v3_id: lessonData.id})
      .sort('display_order ASC').limit(4);

    let dialogueData = [];
    let speakers = [];

    rawDialogues.forEach((dialogue) => {
      if (dialogue.speaker) {
        speakers.push(dialogue.speaker);
      }
      dialogue.vocabulary = [];
      dialogue.sentence = [];
      dialogue.english = dialogue.row_2;
      dialogue.pinyin = '';
      dialogue.simplified = '';
      dialogue.traditional = '';
      dialogue['row_1'].replace(/\(event,\'(.*?)\',\'(.*?)\',\'(.*?)\',\'(.*?)\'.*?\>(.*?)\<\/span\>([^\<]+)?/g, function(A, B, C, D, E, F, G, H) {

        let d = ''; let e = ''; let c = ''; let b = ''; let g = '';

        try {d = decodeURI(D)} catch (err) {
          d = D;
          sails.log.error(err)
        }
        try {e = decodeURI(E)} catch (err) {
          e = E;
          sails.log.error(err)
        }
        try {c = decodeURI(C)} catch (err) {
          c = C;
          sails.log.error(err)
        }
        try {b = decodeURI(B)} catch (err) {
          b = B;
          sails.log.error(err)
        }

        dialogue.pinyin += c + ' ';
        dialogue.simplified += d;
        dialogue.traditional += e;

        if (G) {
          try {g = decodeURI(G)} catch (err) {
            g = G;
            sails.log.error(err)
          }
          dialogue.sentence.push(g);
          dialogue.pinyin += g;
          dialogue.simplified += g;
          dialogue.traditional += g;
        }
      });
      dialogue['audioUrl'] = lessonRoot + dialogue.audio
      dialogue.pinyin = convert.convertPinyinTones(dialogue.pinyin);
      dialogueData.push(_.pick(dialogue, ['audioUrl', 'english', 'pinyin', 'traditional', 'simplified']))
    });

    res.json ({
      lessonTitle: lessonData.title,
      lessonInfo: lessonData,
      vocabulary: vocabData,
      dialogue: dialogueData,
      expansion: []
    })
  }
}