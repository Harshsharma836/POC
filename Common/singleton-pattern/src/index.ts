class ToDOManager {
    static instance: ToDOManager;
    private todo: string[];

    private constructor() {
        this.todo = [];
    }

    static getInstance() {
        if (!ToDOManager.instance) {
            ToDOManager.instance = new ToDOManager();
        }
        return ToDOManager.instance;
    }

    addToDO(todo: string) {
        this.todo.push(todo);
    }

    log() {
        console.log(this.todo);
    }
}

export const toDOManager = ToDOManager.getInstance();