export class UserError extends Error{

    constructor(message){
        super(message)
        this.IsUserError = true
    }

}