using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using Newtonsoft.Json;

namespace RTCTorrent.UI.Models
{
    [DataContract]
    public class MessageModel
    {
        [DataMember]
        [JsonProperty(PropertyName = "type")]
        public string Type { get; set; }

        [DataMember]
        [JsonProperty(PropertyName = "sdp")]
        public string Sdp { get; set; }

        [DataMember]
        [JsonProperty(PropertyName = "label")]
        public string Label { get; set; }

        [DataMember]
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        [DataMember]
        [JsonProperty(PropertyName = "candidate")]
        public string Candidate { get; set; }
    }
}
