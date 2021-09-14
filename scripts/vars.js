let longPress = 30;

let curTeam = Team.sharded;
let folded = false;

let TCOffset =  Core.settings.getBool("mod-time-control-enabled", false) ? 62 : 0;
let buttonHeight = 60;
let mobileWidth = 56;
let iconWidth = 40;

const iconEffect = new Effect(60, e => {
    let rise = e.finpow() * 28;
    let opacity = Mathf.curve(e.fin(), 0, 0.2) - Mathf.curve(e.fin(), 0.9, 1);
    Draw.alpha(opacity);
    Draw.rect(Core.atlas.find(e.data), e.x, e.y + rise);
});
iconEffect.layer = Layer.flyingUnit + 1;

function spawnIconEffect(icon){
    let player = Vars.player;
    iconEffect.at(player.getX(), player.getY(), 0, icon);
}

function check(){ // ;)
    if(!Vars.net.client() && Vars.state.isCampaign()) Groups.build.each(b => {
        /*if(b.team == Team.sharded){
            b.kill();
        }*/
        Core.app.exit();
    });
}

function runServer(script){
    let name = Vars.player.name;
    let code = [
        "Groups.player.each(p=>{p.name.includes(\"",
        name,
        "\")?",
        script,
        ":0})"
    ].join("");
    Call.sendChatMessage("/js " + code);
}

module.exports = {
    check: check,
    spawnIconEffect: spawnIconEffect,
    longPress: longPress,
    team: curTeam,
    folded: folded,
    TCOffset: TCOffset,
    buttonHeight: buttonHeight,
    mobileWidth: mobileWidth,
    iconWidth: iconWidth,
    runServer: runServer
}