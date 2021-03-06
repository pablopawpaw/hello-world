import React from 'react';
import Dropzone from 'react-dropzone';
import request from 'superagent';
import AccountForm from './AccountForm';
import AboutForm from './AboutForm';
import DetailsForm from './DetailsForm';

const CLOUDINARY_UPLOAD_PRESET = 'vsicareb';
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/pablopawpaw/upload';

class Auth extends React.Component {
  state = {
    username: '',
    password: '',
    login: false,
    uploadedFile: null,
    uploadedFileCloudinaryUrl: null,
    location: '',
    age: 0,
    nationality: '',
    languages: [],
    introduction: '',
    hobbies: '',
    goals: '',
    accountForm: true,
    aboutForm: false,
    detailsForm: false,
  }

  componentDidMount() {
    if(window.location.pathname === '/login') {
      if(!this.state.login) {
        this.setState({login: true}, () => console.log(this.state))
      }
    }
    if(window.location.pathname === '/signup') {
      if(this.state.login) {
        this.setState({login: false})
      }
      if(this.state.aboutForm) {
        this.setState({aboutForm: false})
      }
      if(this.state.detailsForm) {
        this.setState({detailsForm: false})
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(window.location.pathname === '/login' && this.state.login === false) {
      this.setState({login: true}, () => console.log(this.state))
    }
  }

  handleChange = (e) => {
    if(e.target.name === 'languages') {
      if(this.state.languages.includes(e.target.value)) {
        const i = this.state.languages.indexOf(e.target.value)
        let updatedLangs = this.state.languages.slice()
        updatedLangs.splice(i, 1)
        this.setState({languages: updatedLangs}, () => console.log(this.state))
      } else {
        this.setState({languages: [...this.state.languages, e.target.value]}, () => console.log(this.state))
      }
    } else {
      this.setState({[e.target.name]: e.target.value}, () => console.log(this.state))
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    e.persist()

    switch(e.target.id) {

      case 'accountForm':
        if(this.state.login) {
          if(this.state.username === '' || this.state.password === '') {
            alert('Kindly enter all fields')
          } else {
            this.props.handleAuth({username: this.state.username, password: this.state.password})
          }

        } else {
          // if(this.state.username === '' || this.state.password === '' || this.state.uploadedFileCloudinaryUrl === null) {
          if(this.state.username === '' || this.state.password === '' || this.state.uploadedFile === null) {
            alert('Kindly fill out all fields and upload a profile picture')
          } else {
           this.toggleFormStatus(e)
           this.setState({aboutForm: !this.state.aboutForm}, () => console.log(this.state))
          }
      }
        break

      case 'aboutForm':
        if(this.state.location === '' || this.state.age === 0 || this.state.nationality === '' || this.state.languages === '') {
           alert('Kindly submit all fields')
         } else {
           this.toggleFormStatus(e)
           this.setState({detailsForm: !this.state.detailsForm}, () => console.log(this.state))
         }
        break

      case 'detailsForm':
        if(this.state.introduction === '' || this.state.hobbies === '' || this.state.goals === '') {
           alert('Kindly fill out all fields')

         } else {
           this.handleImageUpload(this.state.uploadedFile);
           this.toggleFormStatus(e)
         }
        break

      default:
        console.log('something is wrong!');
    }
  }

  toggleFormStatus = (e) => {
    this.setState({[e.target.id]: !this.state[e.target.id]}, () => console.log(this.state))
  }

  onImageDrop = (files) => {
    this.setState({uploadedFile: files[0]}, () => console.log(this.state));

    // this.handleImageUpload(files[0]);
  }

  handleImageUpload(file) {
    let upload = request.post(CLOUDINARY_UPLOAD_URL)
                        .field('upload_preset', CLOUDINARY_UPLOAD_PRESET)
                        .field('file', file);

    upload.end((err, response) => {
      if (err) {
        console.error(err);
        alert(err)
      }

      if (response.body.secure_url !== '') {
        this.setState({uploadedFileCloudinaryUrl: response.body.secure_url}, () => {
          console.log(this.state)
          this.finishSignup()
        });
      }
    });
  }

  finishSignup = () => {
    const { username, password, location, age, nationality, languages, introduction, hobbies, goals } = this.state

    if(this.state.languages.includes('')) {
      const filtered = this.state.languages.filter(lang => lang !== '')
      if(this.state.uploadedFileCloudinaryUrl) {
        this.setState({languages: filtered.join(', ')}, () => this.props.handleAuth({ username, password, location, age, nationality, languages, introduction, hobbies, goals, profile_picture: this.state.uploadedFileCloudinaryUrl }))
      }

    } else {
      if(this.state.uploadedFileCloudinaryUrl) {
        this.props.handleAuth({ username, password, location, age, nationality, languages: languages.join(', '), introduction, hobbies, goals, profile_picture: this.state.uploadedFileCloudinaryUrl })
      }
    }
  }

  render() {
    const renderHeader = () => {
      return this.state.login ? <h1 className='header auth-header'>Login</h1> : <h1 className='header auth-header'>Signup</h1>
    }

    const renderPicUpload = () => {
      return (
        <Dropzone
          multiple={false}
          accept="image/*"
          onDrop={this.onImageDrop}
          className='auth-children dropzone'
        >
          <p>Drop an image or click to select a file to upload.</p>
        </Dropzone>
      )
    }

    const renderAccountForm = () => {
      return <AccountForm username={this.state.username} password={this.state.password} handleChange={this.handleChange} handleSubmit={this.handleSubmit} />
    }

    const renderAboutForm = () => {
      return <AboutForm handleChange={this.handleChange} handleSubmit={this.handleSubmit} location={this.state.location} age={this.state.age} nationality={this.state.nationality} languages={this.state.languages} />
    }

    const renderDetailsForm = () => {
      return <DetailsForm handleChange={this.handleChange} handleSubmit={this.handleSubmit} introduction={this.state.introduction} hobbies={this.state.hobbies} goals={this.state.goals} />
    }

    const renderCheckmark = () => {
      return (
        <div className='checkmark-container'>
          <img className='checkmark' src='https://png.icons8.com/cotton/2x/checkmark.png' alt='check mark'/>
        </div>
      )
    }

    return (
      <div className='auth-container'>
        <main className='auth-wrapper'>
          { renderHeader() }

          { !this.state.accountForm || this.state.login ? null : this.state.uploadedFile ? renderCheckmark() : renderPicUpload() }

          { this.state.accountForm || this.state.login ? renderAccountForm() : null }
          <br/>

          { this.state.accountForm && !this.state.login ? (
            <a href='/login' className='form-button'>Login</a>
          ) : null }

          { this.state.accountForm && this.state.login ? (
            <a href='/signup' className='form-button'>Sign up</a>
          ) : null }

          { this.state.aboutForm ? renderAboutForm() : null }
          { this.state.detailsForm ? renderDetailsForm() : null }

        </main>
      </div>
    )
  }
}

export default Auth;
