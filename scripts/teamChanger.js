const vars = require("vars");

const teams = [Team.derelict, Team.sharded, Team.crux, Team.green, Team.purple, Team.blue];
const teamNames = ["Team.derelict", "Team.sharded", "Team.crux", "Team.green", "Team.purple", "Team.blue"];
const mainTeams = [0, 1, 2];
const titleList = ["[#4d4e58]Derelict[]", "[accent]Sharded[]", "[#f25555]Crux[]", "[#54d67d]Green[]", "[#995bb0]Purple[]", "[#5a4deb]Blue[]"];
const abbreList = ["[#4d4e58]D[]", "[accent]S[]", "[#f25555]C[]", "[#54d67d]G[]", "[#995bb0]P[]", "[#5a4deb]B[]"];
let mode = 1;

function teamLocal(){
    Vars.player.team(vars.curTeam);
}

function teamRemote(){
    const code = "Groups.player.each(e => {e.name.includes(\"" + vars.playerName + "\")?e.team(" + teamNames[teams.indexOf(vars.curTeam)] + "):0})";
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
        vars.curTeam = team;
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
        b.label(() => (abbreList[teams.indexOf(vars.curTeam)]));
    }else{
        b.label(() => (titleList[teams.indexOf(vars.curTeam)]));
    }
    
    b.clicked(() => {
        do{
            mode++;
            if(mode > teamList[teamList.length - 1]) mode = teamList[0];
        }while(teamList.indexOf(mode) == -1);
        vars.curTeam = teams[mode];
        changeTeam();
    });
    
    b.update(() => {
        b.setColor(b.isDisabled() ? Color.white : Vars.player.team.color != null ? Vars.player.team.color : vars.curTeam.color);
    });

    return t.add(b).size(40, 40).color(vars.curTeam.color).pad(0).left();
}

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
    })).padBottom(vars.TCOffset);
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

function foldedTeamChanger(table){
    table.table(Styles.black5, cons(t => {
        t.background(Tex.pane);
        if(Vars.mobile){
            addMini(t, mainTeams, true).width(24);
        }else{
            addMini(t, mainTeams, false).width(100);
        }
    })).padBottom(vars.TCOffset);
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
    add: teamChanger,
    addFolded: foldedTeamChanger,
    mode: mode,
    teams: teams
}