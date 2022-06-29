const URL = "https://forum2022.codeschool.cloud"

var app = new Vue({
    el: "#app",
    data: {
        loginEmailInput: "",
        loginPasswordInput: "",

        newEmailInput: "",
        newPasswordInput: "",
        newFullnameInput: "",

        page: "home",
    },
    
    methods: {
        gotoLogin: function () {
            page = "login";
        },

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
        }
    },

    created: function () {
       this.getSession()
    },
})