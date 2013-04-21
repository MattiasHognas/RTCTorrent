using System;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace RTCTorrent.UI.Models
{
    [DataContract]
    public class SignalStateModel
    {
        [DataMember]
        [JsonProperty(PropertyName = "FromSessionId")]
        public Guid FromSessionId { get; set; }

        [DataMember]
        [JsonProperty(PropertyName = "ToSessionId")]
        public Guid ToSessionId { get; set; }

        [DataMember]
        [JsonProperty(PropertyName = "RoomId")]
        public string RoomId { get; set; }

        [DataMember]
        [JsonProperty(PropertyName = "Message")]
        public string Message { get; set; }
    }
}