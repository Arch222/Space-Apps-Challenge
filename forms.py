from flask_wtf import FlaskForm
from wtforms import StringField, TextField, SubmitField
from wtforms.validators import DataRequired, Length
class ContactForm(FlaskForm):
    """Contact form."""
    latitude = StringField('latitude', [
        DataRequired()])
    longitude = StringField('longitude', [
        DataRequired()])
    submit = SubmitField('Submit')