import { Selector } from 'testcafe'

fixture `ThemeTests`
    .page `http://localhost:8081`

test('default theme is light', async t => {
    const chatstream = Selector('body');
    const bgColor = chatstream.getStyleProperty('background-color');
    await t.expect(bgColor).eql('rgb(250, 250, 250)');
})

test('rocker switch changes theme to dark', async t => {
    await t.click("[data-testid=theme-rocker");

    const chatstream = Selector('body');
    const bgColor = chatstream.getStyleProperty('background-color');
    await t.expect(bgColor).eql('rgb(48, 48, 48)');
})

test('rocker switch changes theme back to light', async t => {
    await t.click("[data-testid=theme-rocker");
    await t.click("[data-testid=theme-rocker");
    
    const chatstream = Selector('body');
    const bgColor = chatstream.getStyleProperty('background-color');
    await t.expect(bgColor).eql('rgb(250, 250, 250)');
})