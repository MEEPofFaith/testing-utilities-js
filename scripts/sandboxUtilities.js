const vars = require("vars");

//NiChrosia's suggesion
let fillMode = true;

function toggleSandbox(){
    vars.check();
    vars.spawnIconEffect(Vars.state.rules.infiniteResources ? "test-utils-survival" : "test-utils-sandbox");
    if(Vars.net.client()){
        let code = "Vars.state.rules.infiniteResources = !Vars.state.rules.infiniteResources";
        Call.sendChatMessage("/js " + code);
    }
    Vars.state.rules.infiniteResources = !Vars.state.rules.infiniteResources;
};

// Fills/dumps the core
function fillCore(){
    vars.check();
    vars.spawnIconEffect(fillMode ? "test-utils-core" : "test-utils-dump");
    if(Vars.net.client()){
        let code;
        if(fillMode){
            code = "Groups.player.each(p=>{p.name.includes(\"" + vars.playerName + "\")?Vars.content.items().each(i=>{p.core().items.set(i,1000000);}):0})";
        }else if(!fillMode){
            code = "Groups.player.each(p=>{p.name.includes(\"" + vars.playerName + "\")?Vars.content.items().each(i=>{p.core().items.set(i,0);}):0})";
        }
        Call.sendChatMessage("/js " + code);
    }else{
        let core = Vars.player.core();
        Vars.content.items().each(i => {
            const item = i;
            const mode = fillMode;
            if(core != null){
                core.items.set(item, mode ? core.storageCapacity : 0);
            }
        });
    }
};

function addSandbox(t, mobile){
    let b = new ImageButton(Core.atlas.find("test-utils-survival"), Styles.logici);
    let bs = b.style;
    bs.down = Styles.flatDown;
    bs.over = Styles.flatOver;
    bs.disabled = Tex.whiteui.tint(0.625, 0, 0, 0.8);
    bs.imageDisabledColor = Color.gray;
    bs.imageUpColor = Color.white;

    if(!mobile){
        b.label(() => Vars.state.rules.infiniteResources && b.isDisabled() ? "[gray]Survival[]" : Vars.state.rules.infiniteResources && !b.isDisabled() ? "[white]Survival[]" : !Vars.state.rules.infiniteResources && b.isDisabled() ? "[gray]Sandbox[]" : "[white]Sandbox[]").padLeft(0);
    }

    b.setDisabled(() => Vars.state.isCampaign());
    
    b.clicked(() => {
        toggleSandbox();
    });

    b.update(() => {
        //Update offset
        let offset = mobile ? 0 : Vars.state.rules.infiniteResources ? -3 : -2;
        bs.pressedOffsetX = offset;
        bs.unpressedOffsetX = offset;
        bs.checkedOffsetX = offset;

        b.setColor(b.isDisabled() ? Color.white : Vars.player.team.color != null ? Vars.player.team.color : vars.curTeam.color);

        if(!Vars.headless){
            b.replaceImage(new Image(Vars.state.rules.infiniteResources ? Core.atlas.find("test-utils-survival") : Core.atlas.find("test-utils-sandbox")).setScaling(Scaling.bounded));
            b.setColor(Vars.player.team.color != null ? Vars.player.team.color : vars.curTeam.color);
        }
    });

    return t.add(b).color(vars.curTeam.color).pad(0).left();
}

function addFillCore(t, mobile){
    let b = new ImageButton(Core.atlas.find("test-utils-core"), Styles.logici);
    let bs = b.style;
    bs.down = Styles.flatDown;
    bs.over = Styles.flatOver;
    bs.disabled = Tex.whiteui.tint(0.625, 0, 0, 0.8);
    bs.imageDisabledColor = Color.gray;
    bs.imageUpColor = Color.white;

    if(!mobile){
        b.label(() => fillMode && b.isDisabled() ? "[gray]Fill Core[]" : fillMode && !b.isDisabled() ? "[white]Fill Core[]" : !fillMode && b.isDisabled() ? "[gray]Dump Core[]" : "[white]Dump Core[]").padLeft(0);
    }

    let h5 = 0;
    let swap = true;

    b.setDisabled(() => Vars.state.isCampaign());
    
    b.clicked(() => {
        if(swap) fillCore();
    });

    b.update(() => {
        if(b.isPressed() && !b.isDisabled()){
            h5 += Core.graphics.getDeltaTime() * 60;
            if(h5 > vars.longPress && swap){
                fillMode = !fillMode;
                swap = false;
            }
        }else{
            h5 = 0;
            swap = true;
        }
    
        //Update Offset
        let offset = mobile ? 0 : fillMode ? -12 : -4;
        bs.pressedOffsetX = offset;
        bs.unpressedOffsetX = offset;
        bs.checkedOffsetX = offset;

        if(!Vars.headless){
            b.replaceImage(new Image(fillMode ? Core.atlas.find("test-utils-core") : Core.atlas.find("test-utils-dump")).setScaling(Scaling.bounded));
            b.setColor(Vars.player.team.color != null ? Vars.player.team.color : vars.curTeam.color);
        }
    });
    
    return t.add(b).color(vars.curTeam.color).pad(0).left();
}

function sandboxTable(table){
    table.table(Styles.black5, cons(t => {
        t.background(Tex.buttonEdge3);
        if(Vars.mobile){
            addSandbox(t, true).size(vars.iconWidth, 40);
            addFillCore(t, true).size(vars.iconWidth, 40);
        }else{
            addSandbox(t, false).size(108 + vars.iconWidth, 40);
            addFillCore(t, false).size(120 + vars.iconWidth, 40);
        }
    })).padBottom(vars.buttonHeight + vars.TCOffset).padLeft(Vars.mobile ? 60 : 186);
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

function foldedSandboxTable(table){
    table.table(Styles.black5, cons(t => {
        t.background(Tex.buttonEdge3);
        addSandbox(t, true).size(vars.iconWidth, 40);
        addFillCore(t, true).size(vars.iconWidth, 40);
    })).padBottom(vars.buttonHeight + vars.TCOffset).padLeft(vars.iconWidth + 20);
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
    add: sandboxTable,
    addFolded: foldedSandboxTable,
    mode: fillMode
}