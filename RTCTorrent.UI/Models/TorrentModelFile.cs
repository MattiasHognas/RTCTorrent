using System.Collections.Generic;
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
        [JsonProperty(PropertyName = "pieces")]
        public List<TorrentModelFilePiece> Pieces { get; set; }
    }

    [DataContract]
    public class TorrentModelFilePiece
    {
        [DataMember]
        [JsonProperty(PropertyName = "hash")]
        public string Hash { get; set; }
        [DataMember]
        [JsonProperty(PropertyName = "size")]
        public long Size { get; set; }
        [DataMember]
        [JsonProperty(PropertyName = "startByte")]
        public int StartByte { get; set; }
    }
}