using System;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace RTCTorrent.UI.Models
{
    [DataContract]
    public class SessionModel
    {
        [DataMember]
        [JsonProperty(PropertyName = "SessionId")]
        public Guid SessionId { get; set; }

        [DataMember]
        [JsonProperty(PropertyName = "TorrentId")]
        public string TorrentId { get; set; }
    }
}