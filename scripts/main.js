const teams = [Team.derelict, Team.sharded, Team.crux, Team.green, Team.purple, Team.blue];
const teamNames = ["Team.derelict", "Team.sharded", "Team.crux", "Team.green", "Team.purple", "Team.blue"];
const mainTeams = [1, 2];
const titleList = ["[#4d4e58]Derelict[]", "[accent]Sharded[]", "[#f25555]Crux[]", "[#54d67d]Green[]", "[#995bb0]Purple[]", "[#5a4deb]Blue[]"];
const abbreList = ["[#4d4e58]D[]", "[accent]S[]", "[#f25555]C[]", "[#54d67d]G[]", "[#995bb0]P[]", "[#5a4deb]B[]"];
var mode = 1;
var curTeam = Team.sharded;
const timers = new Interval(4);
var buttonHeight = 64;
var TCOffset =  Core.settings.getBool("mod-time-control-enabled", false) ? buttonHeight : 0;

var folded = false;
var fillMode = true;
const longPress = 30;

let playerName = Core.settings.getString("name");

const iconEffect = new Effect(60, e => {
  var rise = e.finpow() * 28;
  var opacity = Mathf.curve(e.fin(), 0, 0.2) - Mathf.curve(e.fin(), 0.9, 1);
  Draw.alpha(opacity);
  Draw.rect(Core.atlas.find(e.data), e.x, e.y + rise);
});
iconEffect.layer = Layer.flyingUnit + 1;

function spawnIconEffect(icon){
  var player = Vars.player;
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
  var b = new Button(Styles.logict);
  var h = 0;
  if(mobile){
    b.label(prov(() => (abbreList[teams.indexOf(team)])));
  }else{
    b.label(prov(() => (titleList[teams.indexOf(team)])));
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
  var b = new Button(Styles.logict);
  var h2 = 0;
  if(mobile){
    b.label(prov(() => (abbreList[teams.indexOf(curTeam)])));
  }else{
    b.label(prov(() => (titleList[teams.indexOf(curTeam)])));
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
  var b = new ImageButton(new TextureRegionDrawable(UnitTypes.gamma.icon(Cicon.full)), Styles.logici);
  b.style.down = Styles.flatDown;
  b.style.over = Styles.flatOver;
  b.style.disabled = Tex.whiteui.tint(0.625, 0, 0, 0.8);
  b.style.imageDisabledColor = Color.lightGray;
  b.style.imageUpColor = Color.white;
  
  var offset = mobile ? 0 : -5;
  b.style.pressedOffsetX = offset;
  b.style.unpressedOffsetX = offset;
  b.style.checkedOffsetX = offset;
  
  b.image(Core.atlas.find("test-utils-seppuku")).size(40).padLeft(-60);
  if(!mobile) b.label(prov(() => ("Seppuku"))).padLeft(-8);
  
  var h3 = 0;
  b.clicked(() => {
    if(h3 > longPress) return;
    if(Vars.net.client()){
      const code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().kill():0})";
      Call.sendChatMessage("/js " + code);
    }else{
      var playerU = Vars.player.unit();
      var type = playerU.type;
      if(type != null){
        Effect.shake(type.hitSize / 1.5, Mathf.pow(type.hitSize, 3.5), playerU);
        Fx.dynamicExplosion.at(playerU.x, playerU.y, type.hitSize / 5);
      }
      playerU.kill();
      playerU.elevation = 0;
      playerU.health = -1;
      playerU.dead = true;
      playerU.destroy(); // I n s t a n t l y    d i e
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
          var playerU = Vars.player.unit();
          var type = playerU.type;
          if(type != null){
            Effect.shake(type.hitSize / 1.5, Mathf.pow(type.hitSize, 3.5), playerU);
            Fx.dynamicExplosion.at(playerU.x, playerU.y, type.hitSize / 5);
          }
          playerU.kill();
          playerU.elevation = 0;
          playerU.health = -1;
          playerU.dead = true;
          playerU.destroy(); // I n s t a n t l y    d i e
        }
      }
    }
    else{
      h3 = 0;
    }
    b.setColor(curTeam.color);
    if(!Vars.player.unit().dead && Vars.player.unit().health > 0){
      if(timers.get(1, 20)){
        var kIcon = Vars.player.unit().type != null ? new TextureRegionDrawable(Vars.player.unit().type.icon(Cicon.full)) : Vars.ui.getIcon("cancel");
        b.style.imageUp = kIcon;
      }
    }
  });
  return t.add(b).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}

function addClone(t, mobile){
  var b = new ImageButton(Vars.ui.getIcon("units", "copy"), Styles.logici);
  b.style.down = Styles.flatDown;
  b.style.over = Styles.flatOver;
  b.style.disabled = Tex.whiteui.tint(0.625, 0, 0, 0.8);
  b.style.imageDisabledColor = Color.lightGray;
  b.style.imageUpColor = Color.white;
  
  var offset = mobile ? 0 : -4;
  b.style.pressedOffsetX = offset;
  b.style.unpressedOffsetX = offset;
  b.style.checkedOffsetX = offset;

  b.setDisabled(() => Vars.state.isCampaign());
  
  b.image(Core.atlas.find("test-utils-clone")).size(40).padLeft(-60);
  if(!mobile) b.label(prov(() => ("Clone"))).padLeft(-8);
  
  var h4 = 0;
  b.clicked(() => {
    if(h4 > longPress) return;
    if(Vars.net.client()){
      const code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().type.spawn(p.team(),p.getX(),p.getY()):0})";
      Call.sendChatMessage("/js " + code);
    }else if(Vars.player.unit().type != null){
      Tmp.v1.rnd(Mathf.random(Vars.player.unit().type.hitSize * 3));
      var unit = Vars.player.unit().type.spawn(Vars.player.team(), Vars.player.getX() + Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);

      unit.rotation = Mathf.random(360);
      unit.add();
      Fx.spawn.at(Vars.player.getX() + Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);
    }
  });
  
  b.update(() => {
    if(b.isPressed()){
      h4 += Core.graphics.getDeltaTime() * 60;
      if(h4 > longPress && timers.get(2, 5)){
        if(Vars.net.client()){
          const code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().type.spawn(p.team(),p.getX(),p.getY()):0})";
          Call.sendChatMessage("/js " + code);
        }else if(Vars.player.unit().type != null){
          Tmp.v1.rnd(Mathf.random(Vars.player.unit().type.hitSize * 3));
          var unit = Vars.player.unit().type.spawn(Vars.player.team(), Vars.player.getX() + Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);

          unit.rotation = Mathf.random(360);
          unit.add();
          Fx.spawn.at(Vars.player.getX() + Tmp.v1.x, Vars.player.getY() + Tmp.v1.y);
        }
      }
    }
    else{
      h4 = 0;
    }
    b.setColor(curTeam.color);
    if(!Vars.player.unit().dead && Vars.player.unit().health > 0){
      if(timers.get(3, 20)){
        var dIcon = Vars.player.unit().type != null ? new TextureRegionDrawable(Vars.player.unit().type.icon(Cicon.full)) : Vars.ui.getIcon("cancel");
        b.style.imageUp = dIcon;
      }
    }
  });
  return t.add(b).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}


//Endregin
//Region Heal/Invincibility

function addHeal(t, mobile){
  var b = new ImageButton(Core.atlas.find("test-utils-heal"), Styles.logici);
  b.style.down = Styles.flatDown;
  b.style.over = Styles.flatOver;
  b.style.disabled = Tex.whiteui.tint(0.625, 0, 0, 0.8);
  b.style.imageDisabledColor = Color.lightGray;
  b.style.imageUpColor = Color.white;
  
  var offset = mobile ? 0 : -4;
  b.style.pressedOffsetX = offset;
  b.style.unpressedOffsetX = offset;
  b.style.checkedOffsetX = offset;
  
  if(!mobile){
    b.label(prov(() => ("Heal"))).padLeft(0);
  }
  
  b.clicked(() => {
    if(Vars.net.client()){
      let code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().dead=false:0})";
      Call.sendChatMessage("/js " + code);
      code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().maxHealth=p.unit().type.health:0})";
      Call.sendChatMessage("/js " + code);
      code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().health=p.unit().maxHealth:0})";
      Call.sendChatMessage("/js " + code);
    }else{
      var player = Vars.player;
      player.unit().dead = false;
      player.unit().maxHealth = player.unit().type.health;
      player.unit().health = Vars.player.unit().maxHealth;
      spawnIconEffect("test-utils-heal");
    }
  });
  
  return t.add(b).color(Color.valueOf("84F491")).pad(1).padLeft(0).padRight(0);
}

function addInvincibility(t, mobile){
  var b = new ImageButton(Core.atlas.find("test-utils-invincibility"), Styles.logici);
  b.style.down = Styles.flatDown;
  b.style.over = Styles.flatOver;
  b.style.disabled = Tex.whiteui.tint(0.625, 0, 0, 0.8);
  b.style.imageDisabledColor = Color.lightGray;
  b.style.imageUpColor = Color.white;
  
  var offset = mobile ? 0 : -4;
  b.style.pressedOffsetX = offset;
  b.style.unpressedOffsetX = offset;
  b.style.checkedOffsetX = offset;

  b.setDisabled(() => Vars.state.isCampaign());
  
  if(!mobile){
    b.label(prov(() => ("Invincibility"))).padLeft(0);
  }
  
  b.clicked(() => {
    if(Vars.net.client()){
      let code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().dead=false:0})";
      Call.sendChatMessage("/js " + code);
      code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().maxHealth=Number.MAX_VALUE:0})";
      Call.sendChatMessage("/js " + code);
      code = "Groups.player.each(p=>{p.name.includes(\"" + playerName + "\")?p.unit().health=Number.MAX_VALUE:0})";
      Call.sendChatMessage("/js " + code);
    }else{
      var player = Vars.player;
      player.unit().dead = false;
      player.unit().maxHealth = Number.MAX_VALUE;
      player.unit().health = Number.MAX_VALUE;
      spawnIconEffect("test-utils-invincibility");
    }
  });
  
  return t.add(b).color(Color.valueOf("F3E979")).pad(1).padLeft(0).padRight(0);
}

//EndRegion
//Region NiChrosia suggesions: sandbox toggle/fill core

function toggleSandbox(){
  spawnIconEffect(Vars.state.rules.infiniteResources ? "test-utils-survival" : "test-utils-sandbox");
  Vars.state.rules.infiniteResources = !Vars.state.rules.infiniteResources;
};

// Fills/dumps the core
function fillCore(){
  spawnIconEffect(fillMode ? "test-utils-core" : "test-utils-dump");
  let core = Vars.player.core();
  Vars.content.items().each(i => {
    const item = i;
    const mode = fillMode;
    Time.run(Mathf.random(45), run(() => {
      if(core != null){
        core.items.set(item, mode ? core.storageCapacity : 0);
      }
    }));
  });
};

function addSandbox(t, mobile){
  var b = new ImageButton(Core.atlas.find("test-utils-survival"), Styles.logici);
  b.style.down = Styles.flatDown;
  b.style.over = Styles.flatOver;
  b.style.disabled = Tex.whiteui.tint(0.625, 0, 0, 0.8);
  b.style.imageDisabledColor = Color.gray;
  b.style.imageUpColor = Color.white;

  if(!mobile){
    b.label(() => Vars.state.rules.infiniteResources ? "Survival" : "Sandbox").padLeft(0);
  }

  b.setDisabled(() => Vars.state.isCampaign() || Vars.net.client());
  
  b.clicked(() => {
    toggleSandbox();
  });

  b.update(() => {
    //Update offset
    var offset = mobile ? 0 : Vars.state.rules.infiniteResources ? -3 : -2;
    b.style.pressedOffsetX = offset;
    b.style.unpressedOffsetX = offset;
    b.style.checkedOffsetX = offset;

    b.replaceImage(new Image(Vars.state.rules.infiniteResources ? Core.atlas.find("test-utils-survival") : Core.atlas.find("test-utils-sandbox")).setScaling(Scaling.bounded));
    b.setColor(Vars.player.team.color != null ? Vars.player.team.color : curTeam.color);
  });

  return t.add(b).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}

function addFillCore(t, mobile){
  var b = new ImageButton(Core.atlas.find("test-utils-core"), Styles.logici);
  b.style.down = Styles.flatDown;
  b.style.over = Styles.flatOver;
  b.style.disabled = Tex.whiteui.tint(0.625, 0, 0, 0.8);
  b.style.imageDisabledColor = Color.gray;
  b.style.imageUpColor = Color.white;

  b.label(() => fillMode ? "Fill Core" : "Dump Core").padLeft(0);

  var h5 = 0;
  var swap = true;

  b.setDisabled(() => Vars.state.isCampaign() || Vars.net.client());
  
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
    var offset = mobile ? 0 : fillMode ? -12 : -4;
    b.style.pressedOffsetX = offset;
    b.style.unpressedOffsetX = offset;
    b.style.checkedOffsetX = offset;

    b.replaceImage(new Image(fillMode ? Core.atlas.find("test-utils-core") : Core.atlas.find("test-utils-dump")).setScaling(Scaling.bounded));
    b.setColor(Vars.player.team.color != null ? Vars.player.team.color : curTeam.color);
  });
  
  return t.add(b).color(curTeam.color).pad(1).padLeft(0).padRight(0);
}

//EndRegion
//Region Team Changer Tables

function addTable(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    if(Vars.mobile){
      for(var i = 0; i < teams.length; i++){
        addSingle(t, teams[i], i, true).width(24);
      }
    }else{
      var widths = [100, 100, 60, 68, 70, 60];
      for(var i = 0; i < teams.length; i++){
        addSingle(t, teams[i], i, false).width(widths[i]);
      }
    }
  })).padBottom(TCOffset);
  table.fillParent = true;
  var schem = () => Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty();
  table.visibility = () => !folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

function addMiniT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge1);
    if(Vars.mobile){
      addMini(t, mainTeams, true).width(24);
    }else{
      addMini(t, mainTeams, false).width(100);
    }
  })).padBottom(TCOffset);
  table.fillParent = true;
  var schem = () => Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty();
  table.visibility = () => folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

//EndRegion
//Region Clone/Kill Tables

const mobileWidth = 56;
const iconWidth = 40;
const midStyle = Vars.mobile ? Styles.pane : Styles.black5;

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
  var schem = () => Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty();
  table.visibility = () => !folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

function addMiniSecondT(table){
  var healWidth = iconWidth * 2 + 20
  var xOff = healWidth + (Vars.mobile ? 44 : 120);
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    addClone(t, true).size(mobileWidth, 40);
    addKill(t, true).size(mobileWidth, 40);
  })).padBottom(TCOffset).padLeft(xOff);
  table.fillParent = true;
  var schem = () => Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty();
  table.visibility = () => folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

//EndRegion
//Region Heal/Invincibility Tables

function addThirdT(table){
  table.table(midStyle, cons(t => {
    t.background(Tex.buttonEdge3);
    if(Vars.mobile){
      addHeal(t, true).size(iconWidth, 40);
      addInvincibility(t, true).size(iconWidth, 40);
    }else{
      addHeal(t, false).size(96, 40);
      addInvincibility(t, false).size(164, 40);
    }
  })).padBottom((Vars.mobile ? 2 * buttonHeight : 2 * buttonHeight) + TCOffset);
  table.fillParent = true;
  var schem = () => Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty();
  table.visibility = () => !folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

function addMiniThirdT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.pane);
    addHeal(t, true).size(iconWidth, 40);
    addInvincibility(t, true).size(iconWidth, 40);
  })).padBottom(TCOffset).padLeft(Vars.mobile ? 44 : 120);
  table.fillParent = true;
  var schem = () => Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty();
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
  var schem = () => Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty();
  table.visibility = () => !folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

function addMiniFourthdT(table){
  table.table(Styles.black5, cons(t => {
    t.background(Tex.buttonEdge3);
    addSandbox(t, true).size(iconWidth, 40);
    addFillCore(t, true).size(iconWidth, 40);
  })).padBottom(buttonHeight + TCOffset)
  table.fillParent = true;
  var schem = () => Vars.control.input.lastSchematic != null && !Vars.control.input.selectRequests.isEmpty();
  table.visibility = () => folded && Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && !(Vars.player.unit().type == UnitTypes.block) && !(Vars.player.unit() == null) && (Vars.mobile ? !(Vars.player.unit().isBuilding() || Vars.control.input.block != null || Vars.control.input.mode == PlaceMode.breaking || !Vars.control.input.selectRequests.isEmpty() && !schem.get()) : true);
}

//EndRegion
//Region Add Tables

if(!Vars.headless){
  var ft = new Table();
  var mft = new Table();
  var st = new Table();
  var mst = new Table();
  var tt = new Table();
  var mtt = new Table();
  var fot = new Table();
  var mfot = new Table();
  
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
  });
  
  Events.on(WorldLoadEvent, () => {
    folded = false;
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