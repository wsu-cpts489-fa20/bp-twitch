import { Selector } from 'testcafe'

fixture `TwitchClient`
    .page `http://localhost:8081`

test('can send a message in chat', async t => {
    await t.typeText("#streamSelect", "r2den")
    .click("#streamSelect")
    .pressKey("enter")
    .typeText("#chatTextBox", "test")
    .click("#chatTextBox")
    .wait(1000)
    .pressKey("enter")
    .expect(Selector("#chatTextBox").value).eql("")
})