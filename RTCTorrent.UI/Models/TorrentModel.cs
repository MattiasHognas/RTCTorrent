using System.Collections.Generic;

namespace RTCTorrent.UI.Models
{
    public class TorrentModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public List<string> Files { get; set; }
        public int Seeders { get; set; }
        public int Leechers { get; set; }
        public long Size { get; set; }
    }
}
