import { toDOManager } from "./index";

toDOManager.addToDO('Play Game')

setInterval(() => toDOManager.log(), 2000);

toDOManager.addToDO('Read book');