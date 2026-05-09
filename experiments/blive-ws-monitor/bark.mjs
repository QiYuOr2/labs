const BASE_BARK_URL = 'https://api.day.app/'

/**
 * @typedef {Object} BarkConfig
 * @property {string} title
 * @property {string} content
 * @property {string} group
 */

/**
 * @param {BarkConfig} config bark 链接配置
 * @returns 
 */
export function barkURL(config) {
  const title = config.title ? `${encodeURIComponent(config.title)}/` : ''
  const content = config.content ? `${encodeURIComponent(config.content)}/` : ''
  const group = config.group ? `&group=${config.group}` : ''


  const result = BASE_BARK_URL
    + `${process.env.BARK_KEY}/`
    + title
    + content
    + '?icon=https://unavatar.io/github/qiyuor2'
    + group
  
  return result
}