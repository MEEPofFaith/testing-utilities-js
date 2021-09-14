const vars = require("vars");
const folder = require("folder");
const changer = require("teamChanger");
const self = require("seppuku");
const health = require("health");
const sandbox = require("sandboxUtilities");
const status = require("statusMenu");

function add(source, t, ft){
    source.add(t);
    Vars.ui.hudGroup.addChild(t);
    source.addFolded(ft);
    Vars.ui.hudGroup.addChild(ft);
}

if(!Vars.headless){ //Now this is what I call inefficient hell.
    let fold = new Table().bottom().left();
    let fFold = new Table().bottom().left();
    let change = new Table().bottom().left();
    let fChange = new Table().bottom().left();
    let sep = new Table().bottom().left();
    let fSep = new Table().bottom().left();
    let sand = new Table().bottom().left();
    let fSand = new Table().bottom().left();
    let stat = new Table().bottom().left();
    let fStat = new Table().bottom().left();

    let initialized = false;

    Events.on(ClientLoadEvent, () => {
        add(folder, fold, fFold);
        add(changer, change, fChange);
        add(self, sep, fSep);
        add(sandbox, sand, fSand);
        add(status, stat, fStat);
        
        //Settings
        const dialog = new BaseDialog("Testing Utilities");
        dialog.addCloseButton();
        dialog.cont.center().pane(p => {
            p.defaults().height(36);
            
            function addSetting(name, def){
                p.check(Core.bundle.get("setting." + name + ".name"), Core.settings.getBool(name, def), () => {
                    Core.settings.put(name, !Core.settings.getBool(name, def));
                }).left();
                p.row();
            }
            
            addSetting("startfolded", true); //Start vars.folded
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
                healthUI.add(health.heal()).size(96, 40).color(vars.curTeam.color).pad(0).left().padLeft(4);
                healthUI.add(health.inv()).size(164, 40).color(vars.curTeam.color).pad(0).left().padLeft(-20);
                initialized = true;
            }
        });
    });
    
    Events.on(WorldLoadEvent, () => {
        vars.folded = Core.settings.getBool("startfolded");
        sandbox.mode = true;
        vars.curTeam = Vars.player.team();
        changer.mode = changer.teams.indexOf(vars.curTeam);
    });
    
    Core.app.post(() => {
        const meta = Vars.mods.locateMod("test-utils").meta;
        meta.displayName = "[#FCC21B]Testing Utilities";
        meta.author = "[#FCC21B]MEEP of Faith";
        meta.description = "Utilities for testing stuff" +
            "\n\n\n[#FCC21B]Team Changer:[] Change teams easilty. Hold to collapse or expand the list. [red](Disabled in campaign)" +
            "\n\n[#FCC21B]Seppuku Button:[] Instantly kill yourself. Press and hold to mass kill. A setting to make the death instant can be found in game settings." +
            "\n\n[#FCC21B]Clone Button:[] Instantly clones your player unit. Press and hold to mass clone. [red](Disabled in campaign)" +
            "\n\n[#FCC21B]Heal Button:[] Sets your player unit's hp to its max. [red](Disabled in campaign)" +
            "\n\n[#FCC21B]Invincibility Button:[] Sets your player unit's hp to infinity. [red](Disabled in campaign)" +
            "\n\n[#FCC21B]Sandbox/Survival Button:[] Toggles infinite resources. [red](Disabled in campaign)" +
            "\n\n[#FCC21B]Fill/Dump Core:[] Fill or empty your core of all items. Hold to swap. [red](Disabled in campaign)" +
            "\n\n\n[#FCC21B]Also increases zooming range.[]"
    });
    
    Vars.renderer.minZoom = 0.667; //Zoom out farther
    Vars.renderer.maxZoom = 24; //Get a closer look at yourself
}