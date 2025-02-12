from flask import Flask, request, jsonify, make_response
import secrets
import datetime
from flask_cors import CORS

app = Flask(__name__)

cors_options = {
    "origins": ["http://localhost:5000"],
    "supports_credentials": True,
    "resources": {r"/*": {"origins": "*"}}
}
CORS(app, **cors_options)


users = {}
tokens = {}
TOKEN_EXPIRATION_TIME = datetime.timedelta(minutes=5)


@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    if not username or not password:

        response =  jsonify({"error": "Username and password required"})
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response, 400
    if username in users:
        response =  jsonify({"error": "User already exists"})
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response, 400
    users[username] = password
    response = jsonify({"message": "Registration successful"})
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    if users.get(username) == password:
        access_token = secrets.token_hex(16)
        refresh_token = secrets.token_hex(32)
        expiration_time = datetime.datetime.utcnow() + TOKEN_EXPIRATION_TIME
        tokens[username] = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_at": expiration_time,
        }
        response =  jsonify({"access_token": access_token, "refresh_token": refresh_token, "error": "NoneError"})
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    
    response = jsonify({"error": "Invalid credentials"})
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response, 401

@app.route("/mainpage", methods=["GET"])
def mainpage():
    access_token = request.headers.get("Authorization")
    for username, token_data in tokens.items():
        if token_data["access_token"] == access_token:
            if datetime.datetime.utcnow() > token_data["expires_at"]:
                response = jsonify({"authentification": "failed", "error": "Token expired"})
                response.headers['Access-Control-Allow-Origin'] = '*'
                return response
            response =  jsonify({"authentification": "done"})
            response.headers['Access-Control-Allow-Origin'] = '*'
            return response
    
    response =  jsonify({"authentification": "failed"})
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route("/refresh", methods=["POST"])
def refresh():
    data = request.json
    refresh_token = data.get("refresh_token")
    for username, token_data in tokens.items():
        if token_data["refresh_token"] == refresh_token:
            new_access_token = secrets.token_hex(16)
            new_expiration_time = datetime.datetime.utcnow() + TOKEN_EXPIRATION_TIME
            tokens[username]["access_token"] = new_access_token
            tokens[username]["expires_at"] = new_expiration_time
            response = jsonify({"access_token": new_access_token, "error": "NoneError"})
            response.headers['Access-Control-Allow-Origin'] = '*'
            return response

    response = jsonify({"error": "Invalid refresh token"})
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response, 401


if __name__ == "__main__":
    app.run(debug=True)
