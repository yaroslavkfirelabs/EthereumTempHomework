exports.getConfigs = environment => {
  require('dotenv').config({ path: `.${environment}.env` })
  return {
    ...require(`../configs/common.config`),
    ...require(`../configs/${environment}.config`)
  }
}