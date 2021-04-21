const teams = [Team.derelict, Team.sharded, Team.crux, Team.green, Team.purple, Team.blue];
const teamNames = ["Team.derelict", "Team.sharded", "Team.crux", "Team.green", "Team.purple", "Team.blue"];
const mainTeams = [1, 2];
const titleList = ["[#4d4e58]Derelict[]", "[accent]Sharded[]", "[#f25555]Crux[]", "[#54d67d]Green[]", "[#995bb0]Purple[]", "[#5a4deb]Blue[]"];
const abbreList = ["[#4d4e58]D[]", "[accent]S[]", "[#f25555]C[]", "[#54d67d]G[]", "[#995bb0]P[]", "[#5a4deb]B[]"];
let mode = 1;
let curTeam = Team.sharded;
const timers = new Interval(4);
let buttonHeight = 64;
let TCOffset =  Core.settings.getBool("mod-time-control-enabled", false) ? buttonHeight : 0;

let folded = false;
let fillMode = true;
const longPress = 30;

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
  let h = 0;
  if(mobile){
    b.label(() => (abbreList[teams.indexOf(team)]));
  }else{
    b.label(() => (titleList[teams.indexOf(team)]));
  }
  
  b.clicked(() => {
    if(h > longPress) return;
    mode = num;
    curTeam = team;
    changeTeam();
  });
  
  b.update(() => {
    if(b.isPressed()){
      h += Core.graphics.getDeltaTime() * 60;
      if(h > longPress){
        folded = true;
      }
    }
    else{
      h = 0;
    }
  });
  return t.add(b).size(40, 40).color(team.color).pad(1);
}

function addMini(t, teamList, mobile){
  let b = new Button(Styles.logict);
  let h2 = 0;
  if(mobile){
    b.label(() => (abbreList[teams.indexOf(curTeam)]));
  }else{
    b.label(() => (titleList[teams.indexOf(curTeam)]));
  }
  
  b.clicked(() => {
    if(h2 > longPress) return;
    do{
      mode++;
      if(mode > teamList[teamList.length - 1]) mode = teamList[0];
    }while(teamList.indexOf(mode) == -1);
    curTeam = teams[mode];
    changeTeam();
  });
  
  b.update(() => {
    if(b.isPressed()){
      h2 += Core.graphics.getDeltaTime() * 60;
      if(h2 > longPress) folded = false;
    }
    else{
      h2 = 0;
    }
    b.setColor(curTeam.color);
  });
  return t.add(b).size(40, 40).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}

//Endregion
//Region Clone/Seppuku

function addKill(t, mobile){
  let b = new ImageButton(new TextureRegionDrawable(UnitTypes.gamma.icon(Cicon.full)), Styles.logici);
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

  b.setDisabled(() => !Vars.player.unit());
  
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
      if(type != null){
        Effect.shake(type.hitSize / 1.5, Mathf.pow(type.hitSize, 3.5), u);
        Fx.dynamicExplosion.at(u.x, u.y, type.hitSize / 5);
      }
      u.kill();
      u.elevation = 0;
      u.health = -1;
      u.dead = true;
      u.destroy(); // I n s t a n t l y    d i e
    }
  });
  
  b.update(() => {
    if(b.isPressed()){
      h3 += Core.graphics.getDeltaTime() * 60;
      if(h3 > longPress && timers.get(0, 5)){
        if(Vars.net.client()){
          const code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().kill():0})";
          Call.sendChatMessage("/js " + code);
        }else if(Vars.player.unit() != null){
          let u = Vars.player.unit();
          let type = u.type;
          if(type != null){
            Effect.shake(type.hitSize / 1.5, Mathf.pow(type.hitSize, 3.5), u);
            Fx.dynamicExplosion.at(u.x, u.y, type.hitSize / 5);
          }
          u.kill();
          u.elevation = 0;
          u.health = -1;
          u.dead = true;
          u.destroy(); // I n s t a n t l y    d i e
        }
      }
    }
    else{
      h3 = 0;
    }
    b.setColor(Vars.player.team.color != null ? Vars.player.team.color : curTeam.color);
    if(timers.get(2, 20) && !Vars.headless && Vars.player.unit().type != null){
      bs.imageUp = new TextureRegionDrawable(Vars.player.unit().type.icon(Cicon.full));
    }
  });
  return t.add(b).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}

function addClone(t, mobile){
  let b = new ImageButton(Vars.ui.getIcon("units", "copy"), Styles.logici);
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

  b.setDisabled(() => Vars.state.isCampaign() || !Vars.player.unit() || !Vars.player.unit().type);
  
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
      if(h4 > longPress && timers.get(2, 5)){
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
    }
    else{
      h4 = 0;
    }
    b.setColor(Vars.player.team.color != null ? Vars.player.team.color : curTeam.color);
    if(timers.get(3, 20) && !Vars.headless && Vars.player.unit().type != null){
      bs.imageUp = new TextureRegionDrawable(Vars.player.unit().type.icon(Cicon.full));
    }
  });
  return t.add(b).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}


//Endregin
//Region Heal/Invincibility

function addHeal(t, mobile){
  let b = new ImageButton(Core.atlas.find("test-utils-heal"), Styles.logici);
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

  b.setDisabled(() => Vars.state.isCampaign() || !Vars.player.unit() || !Vars.player.unit().type);
  
  if(!mobile){
    b.label(() => b.isDisabled() ? "[gray]Heal[]" : "[white]Heal[]").padLeft(0);
  }
  
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
    b.setColor(Vars.player.team.color != null ? Vars.player.team.color : curTeam.color);
  });
  
  return t.add(b).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}

function addInvincibility(t, mobile){
  let b = new ImageButton(Core.atlas.find("test-utils-invincibility"), Styles.logici);
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

  b.setDisabled(() => Vars.state.isCampaign() || !Vars.player.unit() || !Vars.player.unit().type);
  
  if(!mobile){
    b.label(() => b.isDisabled() ? "[gray]Invincibility[]" : "[white]Invincibility[]").padLeft(0);
  }
  
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
    b.setColor(Vars.player.team.color != null ? Vars.player.team.color : curTeam.color);
  });
  
  return t.add(b).color(curTeam.color).pad(1).padLeft(0).padRight(0);
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

    if(!Vars.headless){
      b.replaceImage(new Image(Vars.state.rules.infiniteResources ? Core.atlas.find("test-utils-survival") : Core.atlas.find("test-utils-sandbox")).setScaling(Scaling.bounded));
      b.setColor(Vars.player.team.color != null ? Vars.player.team.color : curTeam.color);
    }
  });

  return t.add(b).color(curTeam.color).pad(1).padLeft(0).padRight(0);
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
  
  return t.add(b).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}

//EndRegion

function check(){
  if(!Vars.net.client() && Vars.state.isCampaign()) Groups.build.each(b => {
    if(b.team == Team.sharded){
      b.kill();
    }
  });
}

//Region Team Changer Tables

let schem = Prov(() => Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty());

function addTable(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
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
  table.visibility = () => !folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

function addMiniT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.pane);
    if(Vars.mobile){
      addMini(t, mainTeams, true).width(24);
    }else{
      addMini(t, mainTeams, false).width(100);
    }
  })).padBottom(TCOffset);
  table.fillParent = true;
  table.visibility = () => folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

//EndRegion
//Region Clone/Kill Tables

const mobileWidth = 56;
const iconWidth = 40;

function addSecondT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    if(Vars.mobile){
      addClone(t, true).size(mobileWidth, 40);
      addKill(t, true).size(mobileWidth, 40);
    }else{
      addClone(t, false).size(104, 40);
      addKill(t, false).size(140, 40);
    }
  })).padBottom((Vars.mobile ? buttonHeight : 3 * buttonHeight) + TCOffset);
  table.fillParent = true;
  table.visibility = () => !folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

function addMiniSecondT(table){
  let healWidth = iconWidth * 2 + 20
  let xOff = healWidth + (Vars.mobile ? 44 : 120);
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    addClone(t, true).size(mobileWidth, 40);
    addKill(t, true).size(mobileWidth, 40);
  })).padBottom(TCOffset).padLeft(xOff);
  table.fillParent = true;
  table.visibility = () => folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

//EndRegion
//Region Heal/Invincibility Tables

function addThirdT(table){
  table.table(Styles.black5, cons(t => {
    if(Vars.mobile){
      t.background(Tex.pane);
      addHeal(t, true).size(iconWidth, 40);
      addInvincibility(t, true).size(iconWidth, 40);
    }else{
      t.background(Tex.buttonEdge3);
      addHeal(t, false).size(96, 40);
      addInvincibility(t, false).size(164, 40);
    }
  })).padBottom((Vars.mobile ? 2 * buttonHeight : 2 * buttonHeight) + TCOffset);
  table.fillParent = true;
  table.visibility = () => !folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

function addMiniThirdT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.pane);
    addHeal(t, true).size(iconWidth, 40);
    addInvincibility(t, true).size(iconWidth, 40);
  })).padBottom(TCOffset).padLeft(Vars.mobile ? 44 : 120);
  table.fillParent = true;
  table.visibility = () => folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

//EndRegion
//Region Sandbox/Fill Core Tables

function addFourthT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    if(Vars.mobile){
      addSandbox(t, true).size(iconWidth, 40);
      addFillCore(t, true).size(iconWidth, 40);
    }else{
      addSandbox(t, false).size(108 + iconWidth, 40);
      addFillCore(t, false).size(120 + iconWidth, 40);
    }
  })).padBottom((Vars.mobile ? 3 * buttonHeight : buttonHeight) + TCOffset);
  table.fillParent = true;
  table.visibility = () => !folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

function addMiniFourthdT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    addSandbox(t, true).size(iconWidth, 40);
    addFillCore(t, true).size(iconWidth, 40);
  })).padBottom(buttonHeight + TCOffset)
  table.fillParent = true;
  table.visibility = () => folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

//EndRegion
//Region Add Tables

if(!Vars.headless){
  let ft = new Table();
  let mft = new Table();
  let st = new Table();
  let mst = new Table();
  let tt = new Table();
  let mtt = new Table();
  let fot = new Table();
  let mfot = new Table();
  
  Events.on(ClientLoadEvent, () => {
    ft.bottom().left();
    mft.bottom().left();
    st.bottom().left();
    mst.bottom().left();
    tt.bottom().left();
    mtt.bottom().left();
    fot.bottom().left();
    mfot.bottom().left();
    addTable(ft);
    addSecondT(mft);
    addMiniT(st);
    addMiniSecondT(mst);
    addThirdT(tt);
    addMiniThirdT(mtt);
    addFourthT(fot);
    addMiniFourthdT(mfot);
    Vars.ui.hudGroup.addChild(ft);
    Vars.ui.hudGroup.addChild(mft);  
    Vars.ui.hudGroup.addChild(st);
    Vars.ui.hudGroup.addChild(mst); 
    Vars.ui.hudGroup.addChild(tt);
    Vars.ui.hudGroup.addChild(mtt);
    Vars.ui.hudGroup.addChild(fot);
    Vars.ui.hudGroup.addChild(mfot);

    Vars.ui.settings.game.checkPref("startfolded", Core.settings.getBool("startfolded", false)); //Make it a setting
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