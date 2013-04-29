﻿using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace RTCTorrent.UI.Models
{
    [DataContract]
    public class TorrentModelFile
    {
        [DataMember]
        [JsonProperty(PropertyName = "fullPath")]
        public string FullPath { get; set; }
        [DataMember]
        [JsonProperty(PropertyName = "size")]
        public long Size { get; set; }
        [DataMember]
        [JsonProperty(PropertyName = "hashes")]
        public List<string> Hashes { get; set; }
    }
}