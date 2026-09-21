"""Sengunthar Engineering College - Quiz Competition backend entry point."""
from flask import Flask

from config import Config
from extensions import cors, db, jwt
from routes.admin import admin_bp
from routes.auth import auth_bp
from routes.quiz import quiz_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    cors.init_app(
        app,
        resources={r"/api/*": {"origins": "*"}},
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )
    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(quiz_bp, url_prefix="/api/quiz")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    with app.app_context():
        db.create_all()
        from seed_admin import seed_admin

        seed_admin(app)

    @app.get("/")
    def health():
        return {"status": "ok", "service": "Quiz Competition API", "name": app.config.get("APP_NAME", "quiz-api")}

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)