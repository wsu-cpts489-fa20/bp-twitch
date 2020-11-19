import { Selector } from 'testcafe'

fixture `TwitchClient`
    .page `http://localhost:8081`

test('Can Login via Twitch Oauth', async t => {
    await t.click("#twitchLoginBtn")
    .typeText("[id*=login-username]", "TCGodTesting")
    .typeText("[id*=password-input]", ",gLdc_=eG$fKpa6");

    await t.click('[data-a-target=passport-login-button]')
    .debug();

    await t.typeText("#streamSelect", "r2den")
    .click("#streamSelect")
    .pressKey("enter")
    .typeText("#chatTextBox", "test")
    .click("#chatTextBox")
    .wait(1000)
    .pressKey("enter")
    .expect(Selector("#chatTextBox").value).eql("")
})