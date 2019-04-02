const tap = require('tap')

const supressInversioError = (code, err) => err => !(err && (err.code === code)) && thrw(err)

class Suite {
  constructor (description) {
    this.desription = description
    this.tests = []
    // this.body = Promise.resolve()
  }
  test (description, fn) {
    this.tests.push({description, fn})
    return this
    // this.body = this.body.then(() => tap.test(description, t => fn(t).then(() => t.end())))
    // return this
  }
  run () {
    tap.test(this.description, async t => {
      await this.tests.reduce(async (p, tst) => {
        let {description, fn} = tst
        await p
        await t.test(description, async t => {
          await fn(t)
          t.end()
        })
      }, Promise.resolve())
      t.end()
    })
  }
}

module.exports.supressInversioError = supressInversioError
module.exports.Suite = Suite
