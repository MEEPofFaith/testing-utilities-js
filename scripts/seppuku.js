const vars = require("vars");

const timers = new Interval(2);

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
        if(h3 > vars.longPress) return;
        if(Vars.net.client()){
            const code = "Groups.player.each(p=> {p.name.includes(\"" + vars.playerName + "\")?p.unit().kill():0})";
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
            if(h3 > vars.longPress){
                if(Vars.net.client()){
                    const code = "Groups.player.each(p=> {p.name.includes(\"" + vars.playerName + "\")?p.unit().kill():0})";
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

        b.setColor(b.isDisabled() ? Color.white : Vars.player.team.color != null ? Vars.player.team.color : vars.curTeam.color);

        if(!Vars.headless && Vars.player.unit().type != null && Vars.player.unit().type != UnitTypes.block && timers.get(0, 20)){ //Slight delay to reduce lag
            bs.imageUp = new TextureRegionDrawable(Vars.player.unit().type.icon(Cicon.full));
        }
    });

    return t.add(b).color(vars.curTeam.color).pad(0).left();
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
        vars.check();
        if(h4 > vars.longPress) return;
        if(Vars.net.client()){
            const code = "Groups.player.each(p=> {p.name.includes(\"" + vars.playerName + "\")?p.unit().type.spawn(p.team(),p.getX(),p.getY()):0})";
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
            vars.check();
            h4 += Core.graphics.getDeltaTime() * 60;
            if(h4 > vars.longPress){
                if(Vars.net.client()){
                    const code = "Groups.player.each(p=> {p.name.includes(\"" + vars.playerName + "\")?p.unit().type.spawn(p.team(),p.getX(),p.getY()):0})";
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

        b.setColor(b.isDisabled() ? Color.white : Vars.player.team.color != null ? Vars.player.team.color : vars.curTeam.color);

        if(!Vars.headless && Vars.player.unit().type != null && Vars.player.unit().type != UnitTypes.block && timers.get(1, 20)){ //Slight delay to reduce lag
            bs.imageUp = new TextureRegionDrawable(Vars.player.unit().type.icon(Cicon.full));
        }
    });
    
    return t.add(b).color(vars.curTeam.color).pad(0).left();
}

function selfTable(table){
    table.table(Styles.black5, cons(t => {
        t.background(Tex.buttonEdge3);
        if(Vars.mobile){
            addClone(t, true).size(vars.mobileWidth, 40);
            addKill(t, true).size(vars.mobileWidth, 40);
        }else{
            addClone(t, false).size(104, 40);
            addKill(t, false).size(140, 40);
        }
    })).padBottom((Vars.mobile ? vars.buttonHeight : 2 * vars.buttonHeight) + vars.TCOffset);
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

function foldedSelfTable(table){
    let xOff = Vars.mobile ? 44 : 120;
    table.table(Styles.black5, cons(t => {
        t.background(Tex.pane);
        addClone(t, true).size(vars.mobileWidth, 40);
        addKill(t, true).size(vars.mobileWidth, 40);
    })).padBottom(vars.TCOffset).padLeft(xOff);
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
    add: selfTable,
    addFolded: foldedSelfTable
}