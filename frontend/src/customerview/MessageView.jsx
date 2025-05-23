
const MessageView = ({selectedMessage})=>{
    return (
        <div className="h-[calc(100vh-64px)] p-2 flex flex-col w-1/4 overflow-hidden">
            {selectedMessage}
        </div>
    )
}

export default MessageView;