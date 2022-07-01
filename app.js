const URL = "https://forum2022.codeschool.cloud"

var app = new Vue({
    el: "#app",
    data: {
        page: "welcome",

        loginEmailInput: "",
        loginPasswordInput: "",

        newEmailInput: "",
        newPasswordInput: "",
        newFullnameInput: "",

        threads: [],
        currentThread: {},

        newNameInput: "",
        newDescriptionInput: "",
        newCategoryInput: "",
    },
    
    methods: {
        //get Session
        getSession: async function () {
            let response = await fetch(`${URL}/session`,{
                method: "GET",
                credentials: "include"
            });
            
            //see if user is logged in
            if (response.status == 200){
                //logged in
                console.log("Logged in");
                let data = await response.json();
                console.log(data);
                this.page = "home"
                this.getThread();

            } else if (response.status == 401){
                //not logged in
                console.log("Not Logged in");
                let data = await response.json();
                console.log(data);

            } else{
                //error
                console.log("Error at", response.status, response);
                let data = await response.json();
                console.log(data);
            }
           
        },

        //Attempt to login
        postSession: async function () {
            let loginCredentials = {
                username: this.loginEmailInput,
                password: this.loginPasswordInput
            }
            let response = await fetch(URL + "/session", {
                method: "POST",
                body: JSON.stringify(loginCredentials),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
            });
            //parse response body
            let body = response.json();
            console.log(body);
            
            if (response.status == 201){
                console.log("Logged In")
                this.loginEmailInput = "";
                this.loginPasswordInput = "";
            } else if (response.status == 401){
                console.log("Login Failed");
                this.loginPasswordInput = "";
            } else {
                console.log("Error", response.status, response);
            }
        },

        //create user
        postUser: async function () {
            let newUserCredentials = {
                username: this.newEmailInput,
                fullname: this.newFullnameInput,
                password: this.newPasswordInput,
            }
            let response = await fetch(URL + "/user", {
                method: "POST",
                body: JSON.stringify(newUserCredentials),
                headers: {
                    "Content-Type": "application/json"
                },
                // credentials: "include",
            });
            //parse response body
            let body = response.json();
            console.log(body);
            
            if (response.status == 201){
                console.log("New User Created")
                this.newEmailInput = "";
                this.newPasswordInput = "";
                this.newFullnameInput = "";
            } else if (response.status == 401){
                console.log("Could Not Create User");
                this.newPasswordInput    = "";
            } else {
                console.log("Error", response.status, response);
            }
        },

        //get all the threads in a list
        getThread: async function (){
            let response = await fetch(`${URL}/thread`, {
                method: "GET",
                credentials: "include"
            });

            //check response status
            if (response.status == 200) {
                let body = await response.json();
                this.threads = body;
            } else{
                console.error("Error fetching threads: ", response.status);
            }
        },
        //go to specific thread with comments
        getSingularThread: async function (id){
            let response = await fetch(`${URL}/thread/${id}`, {
                method: "GET",
                credentials: "include"
            });

            //check response status
            if (response.status == 200) {
                this.currentThread = await response.json();
                this.page = "thread";
            } else{
                console.error("Error fetching this thread: ", response.status);
            }
    },
    postThread: async function (){
        let newThread = {
            name: this.newNameInput,
            description: this.newDescriptionInput,
            category: this.newCategoryInput
        }
        let response = await fetch(URL + "/thread", {
            method: "POST",
            body: JSON.stringify(newThread),
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
        });
        //parse response body
        let body = response.json();
        console.log(body);
        
        if (response.status == 201){
            console.log("Created Thread")
            this.newNameInput = "";
            this.newDescriptionInput = "";
            this.newCategoryInput = "";
            
        } else if (response.status == 401){
            console.log("Could Not Create Thread");
        } else {
            console.log("Error", response.status, response);
        }
    }
    },

    created: function () {
       this.getSession()
    },
})