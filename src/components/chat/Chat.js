import React from 'react';
import { ActionCable } from 'react-actioncable-provider';
import { connect } from 'react-redux'
import Message from './Message'

class Chat extends React.Component {
  constructor(props) {
    super(props)

    this.chatWindow = React.createRef();
    this.form = React.createRef();

    this.state = {
      chat: '',
      messages: '',
      text: '',
    };
  };

  componentDidMount() {
    if(this.props.chat) {
      this.setState({chat: this.props.chat}, () => console.log(this.state))
    }
    if(this.props.messages) {
      this.setState({messages: this.props.messages}, () => console.log(this.state))
    }
    console.log('Chat componentDidMount');
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.state.messages !== this.props.messages) {
      this.setState({messages: this.props.messages})
    }
    console.log('Chat componentDidUpdate');
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value})
  }

  handleSubmit = (e) => {
    e.preventDefault()

    if(this.props.chat){
      this.props.newMessage({chat_id: this.props.chat.id, text: this.state.text})
      this.setState({text: ''})
    } else {
      console.log(`still not working`, this.state)
    }
  }

  handleReceivedChat = response => {
    console.log(response);
    this.setState({chat: response}, () => console.log(this.state))
  }

  handleReceiveMsgs = response => {
    console.log(response);
    this.props.setChatMessages()
    this.scrollToBottom()
  }

  renderMsgActionCable = () => {
    if(this.props.chat) {
      return (
        <ActionCable channel={{ channel: 'MessagesChannel', chat: this.props.chat.id }} onReceived={this.handleReceiveMsgs} />
      )
    }
  }

  renderMessages = () => {
    const sortedMessages = this.state.messages.slice().sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
    return sortedMessages.map(msg => <Message key={msg.id} msg={msg} />)
  }

  render() {

    return (
      <div>
        <ActionCable channel={{ channel: 'ChatsChannel' }} onReceived={this.handleReceivedChat} />
        { this.renderMsgActionCable() }

        <h1>Chat Window</h1>
        <div ref={this.chatWindow} id='messages' style={{border: '1px solid black', width: '500px', height: '300px', listStyle: 'none', overflow: 'scroll'}}>
          { this.state.messages ? this.renderMessages() : null}
          <div style={{marginTop: '30px'}} ref={el => this.messagesEnd = el }></div>
        </div>

        <form onSubmit={(e) => this.handleSubmit(e)}>
          <input type='text' name='text' value={this.state.text} onChange={e => this.handleChange(e)} />
          <input type='submit' />
        </form>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    chat: state.appState.chat,
    messages: state.appState.messages
  }
}

export default connect(mapStateToProps)(Chat);
