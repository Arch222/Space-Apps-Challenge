from flask import Flask, render_template, url_for, redirect
from forms import ContactForm


app = Flask(__name__, static_folder='static')
app.config['SECRET_KEY'] = 'any secret string'



@app.route('/')
def index():
	return render_template('index.html')

@app.route('/Airquality')
def Airquality():
	return render_template('Airquality.html')

@app.route('/nightimelights')
def nightimelights():
	return render_template('nightimelights.html')

@app.route('/evi')
def evi():
	return render_template('evi.html')

@app.route('/water')
def water():
	return render_template('water.html')

@app.route('/socioeconomic')
def soc():
	return render_template('soco.html')

@app.route('/location', methods =['GET','POST'])
def change():
	form = ContactForm()
	if form.validate_on_submit():
		return redirect(url_for('demo'))
	return render_template('location.html', form = form)

@app.route('/demo')
def demo():
	return render_template('demo.html')




