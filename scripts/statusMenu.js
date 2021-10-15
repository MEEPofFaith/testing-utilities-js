const vars = require("vars");

// Status Data
let status = StatusEffects.burning;
let duration = 10;

let minDur = 0.125;
let maxDur = 60;

function applyLocal(perma){ // Singleplayer
    let p = Vars.player.unit();
    if(p != null){
        p.apply(status, perma ? Number.MAX_VALUE : duration * 60);
    }
}

function applyRemote(perma){ // Multiplayer
    let eff = "Vars.content.statusEffects().find(b=>b.name===" + status.name + ")";
    vars.runServer("(p.unit()!=null?p.unit().apply(" + eff + "," + (perma ? "2147483647" : duration * 60) + "):0)");
}

function apply(){
    vars.check();
    (Vars.net.client() ? applyRemote : applyLocal)(false);
}

function applyPerma(){
    vars.check();
    (Vars.net.client() ? applyRemote : applyLocal)(true);
}

function clearStatuses(){
    vars.check();
    if(Vars.net.client()){
        vars.runServer("(p.unit()!=null?p.unit().clearStatuses():0)");
    }else{
        let p = Vars.player.unit();
        if(p != null){
            p.clearStatuses();
        }
    }
}

function addStatusMenu(t, mobile){
    const dialog = new BaseDialog("$tu-status-applier");
    const table = dialog.cont;
    const sButton = new ImageButton(status.icon(Cicon.full), Styles.logici);
    let bs = sButton.style;
    bs.down = Styles.flatDown;
    bs.over = Styles.flatOver;
    bs.imageDisabledColor = Color.gray;
    bs.imageUpColor = status.color;
    bs.disabled = Tex.whiteui.tint(0.625, 0, 0, 0.8);

    /* Title */
    table.label(() => status.localizedName + (status.permanent ? " (Permanent effect)" : ""));
    table.row();

    /* Effect selection */
    table.pane(t => {
        let i = 0;

        Vars.content.statusEffects().each(e => {
            if(e == StatusEffects.none) return; //None does nothing, don't show it.

            if(i++ % 8 == 0){
                t.row();
            }

            const icon = new TextureRegionDrawable(e.icon(Cicon.full)).tint(e.color);
            t.button(icon, () => {
                status = e;
                bs.imageUp = icon;
                bs.imageUpColor = e.color;
            }).size(64);
        });
    }).top().center();
    table.row();

    /* Duration Selection */
    const d = table.table().center().bottom().get();
    let dSlider, dField;
    d.defaults().left();
    dSlider = d.slider(minDur, maxDur, 0.125, duration, n => {
        duration = n;
        dField.text = n;
    }).get();
    d.add("Duration (seconds): ").padLeft(8);
    dField = d.field("" + duration, text => {
        duration = parseInt(text);
        dSlider.value = duration;
    }).get();
    dField.validator = text => !isNaN(parseInt(text));
    table.row();

    /* Buttons */
    table.table(null, b => {
        b.defaults().size(210, 64);

        b.button("$tu.apply-effect", Icon.add, apply).padRight(6);
        b.button("$tu.apply-perma", Icon.add, applyPerma);
    }).growX();

    dialog.addCloseButton();
    dialog.buttons.button("$tu.clear-effects", Icon.cancel, clearStatuses);

    /* Set clicky */
    if(!mobile){
        sButton.label(() => sButton.isDisabled() ? "[gray]Status Menu[]" : "[white]Status Menu[]").padLeft(0);
    }

    sButton.setDisabled(() => Vars.state.isCampaign() || !Vars.player.unit());

    sButton.clicked(() => {
        dialog.show();
    });

    return t.add(sButton).pad(0).left();
}

function statusTable(table){
    table.table(Styles.black5, cons(t => {
        t.background(Tex.pane);
        if(Vars.mobile){
            addStatusMenu(t, true).size(vars.iconWidth, 40);
        }else{
            addStatusMenu(t, false).size(128 + vars.iconWidth, 40);
        }
    })).padBottom(vars.buttonHeight + vars.TCOffset);
    table.fillParent = true;
    table.visibility = () => {
        if(vars.folded) return false;
        if(!Vars.ui.hudfrag.shown) return false;
        if(Vars.ui.minimapfrag.shown()) return false;
        if(!Vars.mobile) return true;
        if(Vars.player.unit().isBuilding()) return false;
        if(Vars.control.input.block != null) return false;
        if(Vars.control.input.mode == PlaceMode.breaking) return false;
        if(!Vars.control.input.selectRequests.isEmpty() && Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty()) return false;
        return true;
    };
}

function foldedStatusTable(table){
    table.table(Styles.black5, cons(t => {
        t.background(Tex.pane);
        addStatusMenu(t, true).size(vars.iconWidth, 40);
    })).padBottom(vars.buttonHeight + vars.TCOffset);
    table.fillParent = true;
    table.visibility = () => {
        if(!vars.folded) return false;
        if(!Vars.ui.hudfrag.shown) return false;
        if(Vars.ui.minimapfrag.shown()) return false;
        if(!Vars.mobile) return true;
        if(Vars.player.unit().isBuilding()) return false;
        if(Vars.control.input.block != null) return false;
        if(Vars.control.input.mode == PlaceMode.breaking) return false;
        if(!Vars.control.input.selectRequests.isEmpty() && Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty()) return false;
        return true;
    };
}

module.exports = {
    add: statusTable,
    addFolded: foldedStatusTable
}
