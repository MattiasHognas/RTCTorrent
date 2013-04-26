using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace RTCTorrent.UI.Models
{
    [DataContract]
    public class TorrentModel
    {
        [DataMember]
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        [DataMember]
        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [DataMember]
        [JsonProperty(PropertyName = "files")]
        public List<TorrentModelFile> Files { get; set; }

        [DataMember]
        [JsonProperty(PropertyName = "seeders")]
        public int Seeders { get; set; }

        [DataMember]
        [JsonProperty(PropertyName = "leechers")]
        public int Leechers { get; set; }

        [DataMember]
        [JsonProperty(PropertyName = "size")]
        public long Size { get; set; }
    }
}
