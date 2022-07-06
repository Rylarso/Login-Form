var db = connect("mongodb+srv://Rylarso:codeschool@cluster0.er7oi.mongodb.net/?retryWrites=true&w=majority");

db = db.getSiblingDB("cs-forum-2022");

db.createUser({
  user: "new_user",
  pwd: "password",
  roles: [{ role: "readWrite", db: "cs-forum-2022" }],
  passwordDigestor: "server",
});