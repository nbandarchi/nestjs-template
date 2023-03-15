// This is a hack to run a "test" that will seed our test data so it can be verified with curl/postman
import { TestUtil } from './src/testing/util'

it('should seed test data', async () => {
  await TestUtil.deleteTestDbRecords()
  await TestUtil.createTestDbRecords()
})
