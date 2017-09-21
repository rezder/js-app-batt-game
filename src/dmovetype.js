export const Init=0;
export const Cone=1;
export const Deck=2;
export const Hand=3;
export const Scout1=4;
export const Scout2=5;
export const Scout3=6;
export const ScoutReturn=7;
export const GiveUp=8;
export const Pause=9;
export const None=10;

export const Values=[0,1,2,3,4,5,6,7,8,9,10];
const TEXTS=["Init","Cone","Deck","Hand","Scout 1","Scout 2","Scout 3","Scout Return",
             "Give Up","Pause","None"];
export function text(v){
    if (Values.includes(v)){
        return TEXTS[v];
    }else{
        throw new Error("Move type domain value: "+v+" does not exist");
    }
}
