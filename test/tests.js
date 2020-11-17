import { Selector } from 'testcafe'

fixture `TwitchClient`
    .page `http://localhost:8081`

test('Chat box clears on submit', async t => {
    await t.click("#testLoginButton")
    .typeText("#streamSelect", "r2den")
    .click("#streamSelect")
    .pressKey("enter")
    .typeText("#chatTextBox", "test")
    .click("#chatTextBox")
    .pressKey("enter")
    .expect(Selector("#chatTextBox").value).eql("")
})