/*
 * Copyright © 2020. Ugis Rozkalns. All Rights Reserved.
 */

const groupBy = (key) => (array) =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key]
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj)
    return objectsByKeyValue
  }, {})

const targets = {
  newbie: 50,
  elementary: 80,
  'pre intermediate': 100,
  intermediate: 120,
  'upper intermediate': 160,
  advanced: 120,
  media: 80,
}

const levelData = [
  {
    label: 'Newbie',
    color: '#2487C1',
    img:
      'https://www.chinesepod.com/images/levels/newbie/cpod_level_newbie.svg',
    id: 'newbie',
  },
  {
    label: 'Elementary',
    color: '#35C567',
    img:
      'https://www.chinesepod.com/images/levels/elementary/cpod_level_elementary.svg',
    id: 'elementary',
  },
  {
    label: 'Pre-Intermediate',
    img:
      'https://www.chinesepod.com/images/levels/pre-intermediate/cpod_level_pre-intermediate.svg',
    color: '#F7B500',
    id: 'pre intermediate',
  },
  {
    label: 'Intermediate',
    color: '#FF4D0F',
    img:
      'https://www.chinesepod.com/images/levels/intermediate/cpod_level_intermediate.svg',
    id: 'intermediate',
  },
  {
    label: 'Upper-Intermediate',
    color: '#E1001E',
    img:
      'https://www.chinesepod.com/images/levels/upper-intermediate/cpod_level_upper-intermediate.svg',
    id: 'upper intermediate',
  },
  {
    label: 'Advanced',
    color: '#89006B',
    img:
      'https://www.chinesepod.com/images/levels/advanced/cpod_level_advanced.svg',
    id: 'advanced',
  },
]

const calculateLogs = async (date, email) => {
  let sql = `
      SELECT DATE(log.accesslog_time) as date, count(distinct DATE_FORMAT(log.accesslog_time, '%Y-%m-%d %H:%i')) AS count FROM chinesepod_logging.cp_accesslog log
      WHERE log.accesslog_time > $1 AND accesslog_user = $2
      GROUP BY DATE(log.accesslog_time);
      `
  return (
    await BackupLogging.getDatastore().sendNativeQuery(sql, [date, email])
  )['rows']
}

const timeSpent = async (email) => {
  let sql = `
      SELECT count(distinct DATE_FORMAT(log.accesslog_time, '%Y-%m-%d %H:%i')) AS count FROM chinesepod_logging.cp_accesslog log
      WHERE accesslog_user = $1;
      `
  return (await BackupLogging.getDatastore().sendNativeQuery(sql, [email]))[
    'rows'
  ][0]['count']
}

const timeSpentBetween = async (email, fromDate, toDate) => {
  let sql = `
      SELECT count(distinct DATE_FORMAT(log.accesslog_time, '%Y-%m-%d %H:%i')) AS count FROM chinesepod_logging.cp_accesslog log
      WHERE log.accesslog_user = $1
      AND log.accesslog_time BETWEEN $2 AND $3;
      `
  return (
    await BackupLogging.getDatastore().sendNativeQuery(sql, [
      email,
      fromDate,
      toDate,
    ])
  )['rows'][0]['count']
}
const batchTimeSpentBetween = async (emails, fromDate, toDate) => {
  let sql = `
      SELECT count(distinct DATE_FORMAT(log.accesslog_time, '%Y-%m-%d %H:%i')) AS count FROM chinesepod_logging.cp_accesslog log
      WHERE log.accesslog_user in ($1)
      AND log.accesslog_time BETWEEN $2 AND $3;
      `
  return (
    await BackupLogging.getDatastore().sendNativeQuery(sql, [
      emails,
      fromDate,
      toDate,
    ])
  )['rows'][0]['count']
}

const toObject = (arr) => {
  var rv = {}
  arr.forEach((option) => {
    rv[option.option_key] = option.option_value
  })
  return rv
}

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

module.exports = {
  groupBy,
  targets,
  levelData,
  calculateLogs,
  timeSpent,
  timeSpentBetween,
  batchTimeSpentBetween,
  toObject,
  asyncForEach,
}
