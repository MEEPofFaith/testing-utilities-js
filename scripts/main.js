const teams = [Team.derelict, Team.sharded, Team.crux, Team.green, Team.purple, Team.blue];
const teamNames = ["Team.derelict", "Team.sharded", "Team.crux", "Team.green", "Team.purple", "Team.blue"];
const mainTeams = [0, 1, 2];
const titleList = ["[#4d4e58]Derelict[]", "[accent]Sharded[]", "[#f25555]Crux[]", "[#54d67d]Green[]", "[#995bb0]Purple[]", "[#5a4deb]Blue[]"];
const abbreList = ["[#4d4e58]D[]", "[accent]S[]", "[#f25555]C[]", "[#54d67d]G[]", "[#995bb0]P[]", "[#5a4deb]B[]"];
let mode = 1;
let curTeam = Team.sharded;
const timers = new Interval(2);
let buttonHeight = 60;
let TCOffset =  Core.settings.getBool("mod-time-control-enabled", false) ? 62 : 0;

let folded = false;
let fillMode = true;
const longPress = 30;

// Status Data
let status = StatusEffects.burning;
let duration = 10;

let minDur = 0.125;
let maxDur = 60;

let playerName = Core.settings.getString("name");

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

// Region Team Changer

function teamLocal(){
    Vars.player.team(curTeam);
}

function teamRemote(){
    const code = "Groups.player.each(e =>{e.name.includes(\"" + playerName + "\")?e.team(" + teamNames[teams.indexOf(curTeam)] + "):0})";
    Call.sendChatMessage("/js " + code);
}

function changeTeam(){
    (Vars.net.client() ? teamRemote : teamLocal)();
}

function addSingle(t, team, num, mobile){
    let b = new Button(Styles.logict);
    let bs = b.style;
    bs.disabled = Tex.whiteui.tint(0.625, 0, 0, 0.8);
    
    b.setDisabled(() => Vars.state.isCampaign() || Vars.player.unit().type == UnitTypes.block);

    if(mobile){
        b.label(() => (abbreList[teams.indexOf(team)]));
    }else{
        b.label(() => (titleList[teams.indexOf(team)]));
    }
    
    b.clicked(() => {
        mode = num;
        curTeam = team;
        changeTeam();
    });
    
    b.update(() => {
        b.setColor(b.isDisabled() ? Color.white : team.color);
    });

    return t.add(b).size(40, 40).color(team.color).pad(0);
}

function addMini(t, teamList, mobile){
    let b = new Button(Styles.logict);
    let bs = b.style;
    bs.disabled = Tex.whiteui.tint(0.625, 0, 0, 0.8);
    
    b.setDisabled(() => Vars.state.isCampaign() || Vars.player.unit().type == UnitTypes.block);

    if(mobile){
        b.label(() => (abbreList[teams.indexOf(curTeam)]));
    }else{
        b.label(() => (titleList[teams.indexOf(curTeam)]));
    }
    
    b.clicked(() => {
        do{
            mode++;
            if(mode > teamList[teamList.length - 1]) mode = teamList[0];
        }while(teamList.indexOf(mode) == -1);
        curTeam = teams[mode];
        changeTeam();
    });
    
    b.update(() => {
        b.setColor(b.isDisabled() ? Color.white : Vars.player.team.color != null ? Vars.player.team.color : curTeam.color);
    });

    return t.add(b).size(40, 40).color(curTeam.color).pad(0).left();
}

function folding(t){
    let b = new ImageButton(Icon.resize, Styles.logici);
    let bs = b.style;
    bs.down = Styles.flatDown;
    bs.over = Styles.flatOver;
    bs.imageDisabledColor = Color.gray;
    bs.imageUpColor = Color.white;

    b.clicked(() => {
        folded = !folded;
    });

    return t.add(b).size(40, 40).pad(0).left();
}

//Endregion
//Region Clone/Seppuku

function addKill(t, mobile){
    let b = new ImageButton(Vars.ui.getIcon("units"), Styles.logici);
    b.getImage().setScaling(Scaling.fit);
    let bs = b.style;
    bs.down = Styles.flatDown;
    bs.over = Styles.flatOver;
    bs.disabled = Tex.whiteui.tint(0.625, 0, 0, 0.8);
    bs.imageDisabledColor = Color.gray;
    bs.imageUpColor = Color.white;
    
    let offset = mobile ? 0 : -5;
    bs.pressedOffsetX = offset;
    bs.unpressedOffsetX = offset;
    bs.checkedOffsetX = offset;

    b.setDisabled(() => !Vars.player.unit() || Vars.player.unit().type == UnitTypes.block);
    
    b.image(Core.atlas.find("test-utils-seppuku")).size(40).padLeft(-60);
    if(!mobile){
        b.label(() => b.isDisabled() ? "[gray]Seppuku[]" : "[white]Seppuku[]").padLeft(-8);
    }
    
    let h3 = 0;
    b.clicked(() => {
        if(h3 > longPress) return;
        if(Vars.net.client()){
            const code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().kill():0})";
            Call.sendChatMessage("/js " + code);
        }else{
            let u = Vars.player.unit();
            let type = u.type;
            u.kill();
            if(Core.settings.getBool("instakill")){ // I n s t a n t l y    d i e
                if(type != null){
                    Effect.shake(type.hitSize, type.hitSize, u);
                    Fx.dynamicExplosion.at(u.x, u.y, type.hitSize / 5);
                }
                u.elevation = 0;
                u.health = -1;
                u.dead = true;
                u.destroy();
            }
        }
    });
    
    b.update(() => {
        if(b.isPressed()){
            h3 += Core.graphics.getDeltaTime() * 60;
            if(h3 > longPress){
                if(Vars.net.client()){
                    const code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().kill():0})";
                    Call.sendChatMessage("/js " + code);
                }else if(Vars.player.unit() != null){
                    let u = Vars.player.unit();
                    let type = u.type;
                    u.kill();
                    if(Core.settings.getBool("instakill")){ // I n s t a n t l y    d i e
                        if(type != null){
                        Effect.shake(type.hitSize, type.hitSize, u);
                        Fx.dynamicExplosion.at(u.x, u.y, type.hitSize / 5);
                        }
                        u.elevation = 0;
                        u.health = -1;
                        u.dead = true;
                        u.destroy();
                    }
                }
            }
        }else{
            h3 = 0;
        }

        b.setColor(b.isDisabled() ? Color.white : Vars.player.team.color != null ? Vars.player.team.color : curTeam.color);

        if(!Vars.headless && Vars.player.unit().type != null && Vars.player.unit().type != UnitTypes.block && timers.get(0, 20)){ //Slight delay to reduce lag
            bs.imageUp = new TextureRegionDrawable(Vars.player.unit().type.icon(Cicon.full));
        }
    });

    return t.add(b).color(curTeam.color).pad(0).left();
}

function addClone(t, mobile){
    let b = new ImageButton(Vars.ui.getIcon("units"), Styles.logici);
    b.getImage().setScaling(Scaling.fit);
    let bs = b.style;
    bs.down = Styles.flatDown;
    bs.over = Styles.flatOver;
    bs.disabled = Tex.whiteui.tint(0.625, 0, 0, 0.8);
    bs.imageDisabledColor = Color.gray;
    bs.imageUpColor = Color.white;
    
    let offset = mobile ? 0 : -4;
    bs.pressedOffsetX = offset;
    bs.unpressedOffsetX = offset;
    bs.checkedOffsetX = offset;

    b.setDisabled(() => Vars.state.isCampaign() || !Vars.player.unit() || !Vars.player.unit().type || Vars.player.unit().type == UnitTypes.block);
    
    b.image(Core.atlas.find("test-utils-clone")).size(40).padLeft(-60);
    if(!mobile){
        b.label(() => b.isDisabled() ? "[gray]Clone[]" : "[white]Clone[]").padLeft(-8);
    }
    
    let h4 = 0;
    b.clicked(() => {
        check();
        if(h4 > longPress) return;
        if(Vars.net.client()){
            const code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().type.spawn(p.team(),p.getX(),p.getY()):0})";
            Call.sendChatMessage("/js " + code);
        }else if(Vars.player.unit().type != null){
            Tmp.v1.rnd(Mathf.random(Vars.player.unit().type.hitSize * 3));
            let unit = Vars.player.unit().type.spawn(Vars.player.team(), Vars.player.getX() + Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);

            unit.rotation = Mathf.random(360);
            unit.add();
            Fx.spawn.at(Vars.player.getX() + Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);
        }
    });
    
    b.update(() => {
        if(b.isPressed()){
            check();
            h4 += Core.graphics.getDeltaTime() * 60;
            if(h4 > longPress){
                if(Vars.net.client()){
                    const code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().type.spawn(p.team(),p.getX(),p.getY()):0})";
                    Call.sendChatMessage("/js " + code);
                }else if(Vars.player.unit().type != null){
                    Tmp.v1.rnd(Mathf.random(Vars.player.unit().type.hitSize * 3));
                    let unit = Vars.player.unit().type.spawn(Vars.player.team(), Vars.player.getX() + Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);

                    unit.rotation = Mathf.random(360);
                    unit.add();
                    Fx.spawn.at(Vars.player.getX() + Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);
                }
            }
        }else{
            h4 = 0;
        }

        b.setColor(b.isDisabled() ? Color.white : Vars.player.team.color != null ? Vars.player.team.color : curTeam.color);

        if(!Vars.headless && Vars.player.unit().type != null && Vars.player.unit().type != UnitTypes.block && timers.get(1, 20)){ //Slight delay to reduce lag
            bs.imageUp = new TextureRegionDrawable(Vars.player.unit().type.icon(Cicon.full));
        }
    });
    
    return t.add(b).color(curTeam.color).pad(0).left();
}


//Endregin
//Region Heal/Invincibility

function healButton(){
    let b = new ImageButton(Core.atlas.find("test-utils-heal"), Styles.logici);
    let bs = b.style;
    bs.down = Styles.flatDown;
    bs.over = Styles.flatOver;
    bs.disabled = Tex.whiteui.tint(0.625, 0, 0, 0.8);
    bs.imageDisabledColor = Color.gray;
    bs.imageUpColor = Color.white;
    
    let offset = -4;
    bs.pressedOffsetX = offset;
    bs.unpressedOffsetX = offset;
    bs.checkedOffsetX = offset;

    b.setDisabled(() => Vars.state.isCampaign() || !Vars.player.unit() || !Vars.player.unit().type);
    
    b.label(() => b.isDisabled() ? "[gray]Heal[]" : "[white]Heal[]").padLeft(0);
    
    b.clicked(() => {
        check();
        if(Vars.net.client()){
            let code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().dead=false:0})";
            Call.sendChatMessage("/js " + code);
            code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().maxHealth=p.unit().type.health:0})";
            Call.sendChatMessage("/js " + code);
            code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().health=p.unit().maxHealth:0})";
            Call.sendChatMessage("/js " + code);
        }else{
            let player = Vars.player;
            if(player.unit() != null && player.unit().type != null){
                let u = player.unit();
                u.dead = false;
                u.maxHealth = player.unit().type.health;
                u.health = player.unit().maxHealth;
                spawnIconEffect("test-utils-heal");
            }
        }
    });

    b.update(() =>{
        b.setColor(b.isDisabled() ? Color.white : Vars.player.team.color != null ? Vars.player.team.color : curTeam.color);
    });
    
    return b.left();
}

function invincibilityButton(){
    let b = new ImageButton(Core.atlas.find("test-utils-invincibility"), Styles.logici);
    let bs = b.style;
    bs.down = Styles.flatDown;
    bs.over = Styles.flatOver;
    bs.disabled = Tex.whiteui.tint(0.625, 0, 0, 0.8);
    bs.imageDisabledColor = Color.gray;
    bs.imageUpColor = Color.white;
    
    let offset = -4;
    bs.pressedOffsetX = offset;
    bs.unpressedOffsetX = offset;
    bs.checkedOffsetX = offset;

    b.setDisabled(() => Vars.state.isCampaign() || !Vars.player.unit() || !Vars.player.unit().type);
    
    b.label(() => b.isDisabled() ? "[gray]Invincibility[]" : "[white]Invincibility[]").padLeft(0);
    
    b.clicked(() => {
        check();
        if(Vars.net.client()){
            let code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().dead=false:0})";
            Call.sendChatMessage("/js " + code);
            code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().maxHealth=Number.MAX_VALUE:0})";
            Call.sendChatMessage("/js " + code);
            code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().health=Number.MAX_VALUE:0})";
            Call.sendChatMessage("/js " + code);
        }else{
            let player = Vars.player;
            if(player.unit() != null && player.unit().type != null){
                let u = player.unit();
                u.dead = false;
                u.maxHealth = Number.MAX_VALUE;
                u.health = Number.MAX_VALUE;
                spawnIconEffect("test-utils-invincibility");
            }
        }
    });

    b.update(() =>{
        b.setColor(b.isDisabled() ? Color.white : Vars.player.team.color != null ? Vars.player.team.color : curTeam.color);
    });
    
    return b.left();
    }

    //EndRegion
    //Region NiChrosia suggesions: sandbox toggle/fill core

    function toggleSandbox(){
    check();
    spawnIconEffect(Vars.state.rules.infiniteResources ? "test-utils-survival" : "test-utils-sandbox");
    if(Vars.net.client()){
        let code = "Vars.state.rules.infiniteResources = !Vars.state.rules.infiniteResources";
        Call.sendChatMessage("/js " + code);
    }
    Vars.state.rules.infiniteResources = !Vars.state.rules.infiniteResources;
};

// Fills/dumps the core
function fillCore(){
    check();
    spawnIconEffect(fillMode ? "test-utils-core" : "test-utils-dump");
    if(Vars.net.client()){
        let code;
        if(fillMode){
            code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?Vars.content.items().each(i=>{p.core().items.set(i,1000000);}):0})";
        }else if(!fillMode){
            code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?Vars.content.items().each(i=>{p.core().items.set(i,0);}):0})";
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

        b.setColor(b.isDisabled() ? Color.white : Vars.player.team.color != null ? Vars.player.team.color : curTeam.color);

        if(!Vars.headless){
            b.replaceImage(new Image(Vars.state.rules.infiniteResources ? Core.atlas.find("test-utils-survival") : Core.atlas.find("test-utils-sandbox")).setScaling(Scaling.bounded));
            b.setColor(Vars.player.team.color != null ? Vars.player.team.color : curTeam.color);
        }
    });

    return t.add(b).color(curTeam.color).pad(0).left();
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
            if(h5 > longPress && swap){
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
            b.setColor(Vars.player.team.color != null ? Vars.player.team.color : curTeam.color);
        }
    });
    
    return t.add(b).color(curTeam.color).pad(0).left();
}

//EndRegion
//Region Status Effect Menu

function applyLocal(perma){ // Singleplayer
    let p = Vars.player.unit();
    if(p != null){
        p.apply(status, perma ? Number.MAX_VALUE : duration * 60);
    }
}

function applyRemote(perma){ // Multiplayer
    let eff = "StatusEffects." + status.name;

    let code = [
        "Groups.player.each(p=>{p.name.includes(\"",
        playerName,
        "\")&&p.unit()!=null?p.unit().apply(",
        eff,
        ",",
        perma ? Number.MAX_VALUE : duration * 60,
        "):0})"
    ].join("");

    Call.sendChatMessage("/js " + code);
}

function apply(){
    (Vars.net.client() ? applyRemote : applyLocal)(false);
}

function applyPerma(){
    (Vars.net.client() ? applyRemote : applyLocal)(true);
}

function clearStatuses(){
    if(Vars.net.client()){
        let code = [
            "Groups.player.each(p=>{p.name.includes(\"",
            playerName,
            "\")&&p.unit()!=null?p.unit().clearStatuses()"
        ];
    }else{
        let p = Vars.player.unit();
        if(p != null){
            p.clearStatuses();
        }
    }
}

function addStatusMenu(t, mobile){
    /* I would put this code in a statusApplier.js if I knew enough about js to properly module.exports it.
     * Trust me I've tried.
     * If he read this, QmelZ would probably die.
    */
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
            //None does nothing, don't show it.
            if(e == StatusEffects.none) return;

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
    dialog.addCloseButton();
    dialog.buttons.button("$tu.apply-effect", Icon.add, apply);
    dialog.buttons.button("$tu.apply-perma", Icon.add, applyPerma);
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

//EndRegion

function check(){
    if(!Vars.net.client() && Vars.state.isCampaign()) Groups.build.each(b => {
        if(b.team == Team.sharded){
            b.kill();
        }
    });
}

//Region Folder

function folder(table){
    let a = table.table(Styles.black5, cons(t => {
        t.background(Tex.buttonEdge3);
        folding(t);
    })).padBottom(TCOffset).padLeft(Vars.mobile ? 164 : 480);
    table.fillParent = true;
    table.visibility = () => {
        if(folded) return false;
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

function foldedFolder(table){
    let a = table.table(Styles.black5, cons(t => {
        t.background(Tex.buttonEdge3);
        folding(t);
    })).padBottom(TCOffset).padLeft(Vars.mobile ? 176 : 252);
    table.fillParent = true;
    table.visibility = () => {
        if(!folded) return false;
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

//EndRegion
//Region Team Changer Tables

function teamChanger(table){
    table.table(Styles.black5, cons(t => {
        t.background(Tex.pane);
        if(Vars.mobile){
            for(let i = 0; i < teams.length; i++){
                addSingle(t, teams[i], i, true).width(24);
            }
        }else{
            let widths = [100, 100, 60, 68, 70, 60];
            for(let i = 0; i < teams.length; i++){
                addSingle(t, teams[i], i, false).width(widths[i]);
            }
        }
    })).padBottom(TCOffset);
    table.fillParent = true;
    table.visibility = () => {
        if(folded) return false;
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

function foldedTeamChanger(table){
    table.table(Styles.black5, cons(t => {
        t.background(Tex.pane);
        if(Vars.mobile){
            addMini(t, mainTeams, true).width(24);
        }else{
            addMini(t, mainTeams, false).width(100);
        }
    })).padBottom(TCOffset);
    table.fillParent = true;
    table.visibility = () => {
        if(!folded) return false;
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

//EndRegion
//Region Clone/Kill Tables

const mobileWidth = 56;
const iconWidth = 40;

function selfTable(table){
    table.table(Styles.black5, cons(t => {
        t.background(Tex.buttonEdge3);
        if(Vars.mobile){
            addClone(t, true).size(mobileWidth, 40);
            addKill(t, true).size(mobileWidth, 40);
        }else{
            addClone(t, false).size(104, 40);
            addKill(t, false).size(140, 40);
        }
    })).padBottom((Vars.mobile ? buttonHeight : 2 * buttonHeight) + TCOffset);
    table.fillParent = true;
    table.visibility = () => {
        if(folded) return false;
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

function foldedSelfTable(table){
    let xOff = Vars.mobile ? 44 : 120;
    table.table(Styles.black5, cons(t => {
        t.background(Tex.pane);
        addClone(t, true).size(mobileWidth, 40);
        addKill(t, true).size(mobileWidth, 40);
    })).padBottom(TCOffset).padLeft(xOff);
    table.fillParent = true;
    table.visibility = () => {
        if(!folded) return false;
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

//EndRegion
//Region Sandbox/Fill Core Tables

function sandboxTable(table){
    table.table(Styles.black5, cons(t => {
        t.background(Tex.buttonEdge3);
        if(Vars.mobile){
            addSandbox(t, true).size(iconWidth, 40);
            addFillCore(t, true).size(iconWidth, 40);
        }else{
            addSandbox(t, false).size(108 + iconWidth, 40);
            addFillCore(t, false).size(120 + iconWidth, 40);
        }
    })).padBottom((Vars.mobile ? 2 * buttonHeight : buttonHeight) + TCOffset).padLeft(Vars.mobile ? 60 : 186);
    table.fillParent = true;
    table.visibility = () => {
        if(folded) return false;
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
        addSandbox(t, true).size(iconWidth, 40);
        addFillCore(t, true).size(iconWidth, 40);
    })).padBottom(buttonHeight + TCOffset).padLeft(iconWidth + 20);
    table.fillParent = true;
    table.visibility = () => {
        if(!folded) return false;
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

//EndRegion
//Region Status Menu

function statusTable(table){
    table.table(Styles.black5, cons(t => {
        t.background(Tex.pane);
        if(Vars.mobile){
            addStatusMenu(t, true).size(iconWidth, 40);
        }else{
            addStatusMenu(t, false).size(128 + iconWidth, 40);
        }
    })).padBottom((Vars.mobile ? 2 * buttonHeight : buttonHeight) + TCOffset);
    table.fillParent = true;
    table.visibility = () => {
        if(folded) return false;
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
        addStatusMenu(t, true).size(iconWidth, 40);
    })).padBottom(buttonHeight + TCOffset);
    table.fillParent = true;
    table.visibility = () => {
        if(!folded) return false;
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

//EndRegion
//Region Add Tables

function set(t){
    Vars.ui.hudGroup.addChild(t);
}

if(!Vars.headless){ //Now this is what I call inefficient hell.
    let ff = new Table();
    let fff = new Table();
    let ft = new Table();
    let mft = new Table();
    let st = new Table();
    let mst = new Table();
    let fot = new Table();
    let mfot = new Table();
    let stt = new Table();
    let fstt = new Table();

    let initialized = false;

    Events.on(ClientLoadEvent, () => {
        ff.bottom().left();
        fff.bottom().left();
        ft.bottom().left();
        mft.bottom().left();
        st.bottom().left();
        mst.bottom().left();
        fot.bottom().left();
        mfot.bottom().left();
        stt.bottom().left();
        fstt.bottom().left();

        folder(ff);
        foldedFolder(fff);
        teamChanger(ft);
        selfTable(mft);
        foldedTeamChanger(st);
        foldedSelfTable(mst);
        sandboxTable(fot);
        foldedSandboxTable(mfot);
        statusTable(stt);
        foldedStatusTable(fstt);

        set(ff);
        set(fff);
        set(ft);
        set(mft);  
        set(st);
        set(mst);
        set(fot);
        set(mfot);
        set(stt);
        set(fstt);
        
        //Settings
        const dialog = new BaseDialog("Testing Utilities");
        dialog.addCloseButton();
        dialog.cont.center().pane(p => {
            p.defaults().height(36);
            
            function addSetting(name, def){
                // if(!name || typeof name !== "string") return;
                // if(!def || typeof def !== "boolean") return;
                
                p.check(Core.bundle.get("setting." + name + ".name"), Core.settings.getBool(name, def), () => {
                Core.settings.put(name, !Core.settings.getBool(name, def));
                }).left();
                p.row();
            }
            
            addSetting("startfolded", true); //Start Folded
            addSetting("instakill", false); //Instakill
        }).growY().width(Vars.mobile ? Core.graphics.getWidth() : Core.graphics.getWidth() / 3);
        
        Vars.ui.settings.shown(() => {
            Vars.ui.settings.children.get(1).children.get(0).children.get(0).row();
            Vars.ui.settings.children.get(1).children.get(0).children.get(0).button(Core.bundle.get("tu-title"), Styles.cleart, () => {
                dialog.show();
            });
        });

        //Health/Invincibility buttons
        Events.on(WorldLoadEvent, () => {
            if(!initialized){
                let m = Vars.mobile;
                let healthUI = Vars.ui.hudGroup.children.get(5).children.get(m ? 2 : 0).children.get(0).children.get(0).children.get(0);
                healthUI.row();
                healthUI.add(healButton()).size(96, 40).color(curTeam.color).pad(0).left().padLeft(4);
                healthUI.add(invincibilityButton()).size(164, 40).color(curTeam.color).pad(0).left().padLeft(-20);
                initialized = true;
            }
        });
    });
    
    Events.on(WorldLoadEvent, () => {
        folded = Core.settings.getBool("startfolded");
        fillMode = true;
        curTeam = Vars.player.team();
        mode = teams.indexOf(curTeam);
    });
    
    Core.app.post(() => {
        const meta = Vars.mods.locateMod("test-utils").meta;
        meta.displayName = "[#FCC21B]Testing Utilities";
        meta.author = "[#FCC21B]MEEP of Faith";
        meta.description = "Utilities for testing stuff" +
            "\n\n\n[#FCC21B]Team Changer:[] Change teams easilty. Hold to collapse or expand the list." +
            "\n\n[#FCC21B]Seppuku Button:[] Instantly kill yourself. Press and hold to commit crawler." +
            "\n\n[#FCC21B]Clone Button:[] Instantly clones your player unit. Press and hold to mass clone. [red](Disabled in campaign)[]" +
            "\n\n[#FCC21B]Heal Button:[] Sets your player unit's hp to its max." +
            "\n\n[#FCC21B]Invincibility Button:[] Sets your player unit's hp to infinity. [red](Disabled in campaign)[]" +
            "\n\n[#FCC21B]Sandbox/Survival Button:[] Toggles infinite resources. [red](Disabled in campaign)[]" +
            "\n\n[#FCC21B]Fill/Dump Core:[] Fill or empty your core of all items. Hold to swap. [red](Disabled in campaign)[]" +
            "\n\n\n[#FCC21B]Also increases zooming range.[]"
    });
    
    Vars.renderer.minZoom = 0.667; //Zoom out farther
    Vars.renderer.maxZoom = 24; //Get a closer look at yourself
}