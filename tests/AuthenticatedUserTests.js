import { Selector } from 'testcafe'

fixture `AuthenticatedUserTests`
    .page `http://localhost:8081`

test('can load stream details', async t => {
    await t.typeText("#streamSelect", "r2den")
    .click("#streamSelect")
    .pressKey("enter")
    .wait(300)
    .click("#statsLink")
    .wait(500)
    const detailsModalExists = Selector('[id=detailsModal]').exists
    await t.expect(detailsModalExists).ok()
})
test('confirm by default we are authenticated, but not connected to a channel', async t => {
    const streamSelectExists = Selector('[id=streamSelect]').exists;
    const chatTextBoxExists = Selector('[id=chatTextBox]').exists;
    await t.expect(streamSelectExists).ok();
    await t.expect(chatTextBoxExists).notOk();
})

test('can connect to a stream channels chat', async t => {
    // connect to stream
    await t.typeText("#streamSelect", "r2den")
    .click("#streamSelect")
    .pressKey("enter");

    // If we connected, chat box will now exist. If connection failed, it will not exist. 
    const chatTextBoxExists = Selector('[id=chatTextBox]').exists;
    await t.expect(chatTextBoxExists).ok();
})

test('can send a message in chat', async t => {
    // connect to stream
    await t.typeText("#streamSelect", "r2den")
    .click("#streamSelect")
    .pressKey("enter");

    // send a chat message
    await t.typeText("#chatTextBox", "test")
    .click("#chatTextBox")
    .wait(1000)
    .pressKey("enter")
    .expect(Selector("#chatTextBox").value).eql("");

    // confirm message exists in chat stream
    const chatExists = Selector('[description=test]').exists;
    await t.expect(chatExists).ok();
})

test('broadcaster badge shows when sending chat in your own channel', async t => {
    // Send message in chat.
    await t.typeText("#streamSelect", "r2den")
    .click("#streamSelect")
    .pressKey("enter")
    .typeText("#chatTextBox", "test")
    .click("#chatTextBox")
    .wait(1000)
    .pressKey("enter");

    // Confirm broadcaster badge exists.
    const broadcasterBadgeExists = Selector('[title=Broadcaster]').exists;
    await t.expect(broadcasterBadgeExists).ok();
})