export var act = {};
act.Mess = 1;
act.Invite = 2;
act.InvAccept = 3;
act.InvDecline = 4;
act.InvRetract = 5;
act.Move = 6;
act.Quit = 7;
act.Watch = 8;
act.WatchStop = 9;
act.List = 10;
act.Save = 11;

act.actionBuilder = function actionBuilder(aType) {
    let res = {
        ActType: aType
    };
    res.id = function(idNo) {
        this.ID = idNo;
        return this;
    };
    res.move = function(moveix) {
        this.Moveix = moveix;
        return this;
    };
    res.mess = function(msg) {
        this.Mess = msg;
        return this;
    };
    res.build = function() {
        let act = {
            ActType: this.ActType
        };
        if (this.ID) {
            act.ID = this.ID;
        }
        if (!isNaN(this.Moveix)) {
            act.Moveix = this.Moveix;
        }
        if (this.Mess) {
            act.Mess = this.Mess;
        }
        return act;
    };
    return res;
};
export const TEST=1;
