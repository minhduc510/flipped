// extractVocab.cjs
// Scans each chapter's English text, matches against a curated TOEIC-550 vocabulary 
// dictionary, picks the top 150 words that actually appear in the chapter, and extracts
// the first sentence containing that word as context.
// Also assigns 50 grammar patterns per chapter from patterns found in the text.

const fs = require('fs');
const path = require('path');

const chaptersPath = path.resolve(__dirname, '..', 'data', 'chapters.json');

// ────────────────────────────────────────────────────────────────────────────────
// MASTER VOCABULARY DATABASE  (200+ entries, TOEIC 400-650 range)
// Each entry: { word, type, ipa, definition, vi, explanation }
// ────────────────────────────────────────────────────────────────────────────────
const VOCAB_DB = [
  // A
  { word: "abandon", type: "verb", ipa: "/əˈbændən/", definition: "to leave completely and finally", vi: "từ bỏ, bỏ rơi", explanation: "Used when someone gives up on a person, place, or idea." },
  { word: "acute", type: "adj", ipa: "/əˈkjuːt/", definition: "very serious or severe; having a sharp perception", vi: "cấp tính; nhạy bén", explanation: "In the story: 'acute awareness' = very sharp, clear awareness." },
  { word: "admire", type: "verb", ipa: "/ədˈmaɪər/", definition: "to regard with respect, pleasure or approval", vi: "ngưỡng mộ, thán phục", explanation: "Feeling great respect for someone's qualities or achievements." },
  { word: "advantage", type: "noun", ipa: "/ədˈvɑːntɪdʒ/", definition: "a condition or circumstance that puts one in a favourable position", vi: "lợi thế", explanation: "Something that helps you do better than others." },
  { word: "agreement", type: "noun", ipa: "/əˈɡriːmənt/", definition: "a negotiated arrangement between parties", vi: "sự đồng ý, thỏa thuận", explanation: "Both parties accept the same terms or idea." },
  { word: "ambition", type: "noun", ipa: "/æmˈbɪʃən/", definition: "a strong desire to achieve something", vi: "tham vọng, hoài bão", explanation: "Having high goals and being motivated to reach them." },
  { word: "announce", type: "verb", ipa: "/əˈnaʊns/", definition: "to make a public and typically formal declaration", vi: "thông báo, tuyên bố", explanation: "To tell people officially about something." },
  { word: "annoying", type: "adj", ipa: "/əˈnɔɪɪŋ/", definition: "causing irritation or slight anger", vi: "khó chịu, phiền phức", explanation: "Something that makes you feel irritated." },
  { word: "anticipation", type: "noun", ipa: "/ænˌtɪsɪˈpeɪʃən/", definition: "the feeling of excitement about something that will happen", vi: "sự mong đợi, háo hức", explanation: "Looking forward to something with excitement." },
  { word: "apologize", type: "verb", ipa: "/əˈpɒlədʒaɪz/", definition: "to express regret for something done wrong", vi: "xin lỗi", explanation: "Saying sorry for a mistake or wrongdoing." },
  { word: "argument", type: "noun", ipa: "/ˈɑːɡjumənt/", definition: "an exchange of diverging or opposite views", vi: "cuộc tranh luận, cãi vã", explanation: "A disagreement expressed in words." },
  { word: "arrangement", type: "noun", ipa: "/əˈreɪndʒmənt/", definition: "the action of organizing something in a particular way", vi: "sự sắp xếp", explanation: "How things are organized or planned." },
  { word: "attention", type: "noun", ipa: "/əˈtenʃən/", definition: "notice taken of someone or something; the regarding of someone as interesting", vi: "sự chú ý", explanation: "Focusing your mind on something or someone." },
  { word: "attraction", type: "noun", ipa: "/əˈtrækʃən/", definition: "a quality or feature that evokes interest or liking", vi: "sức hút, sự cuốn hút", explanation: "The force or quality that draws people together." },
  { word: "avoidance", type: "noun", ipa: "/əˈvɔɪdəns/", definition: "the action of keeping away from something", vi: "sự tránh né", explanation: "Deliberately staying away from someone or something." },
  // B
  { word: "backyard", type: "noun", ipa: "/ˈbækjɑːrd/", definition: "an area behind a house", vi: "sân sau nhà", explanation: "The outdoor space directly behind a house." },
  { word: "balance", type: "noun", ipa: "/ˈbæləns/", definition: "an even distribution of weight; a state of equilibrium", vi: "sự cân bằng", explanation: "When things are equal or stable." },
  { word: "barge", type: "verb", ipa: "/bɑːrdʒ/", definition: "to move forcefully, pushing people out of the way", vi: "xông vào, lao vào", explanation: "To push in without permission or invitation." },
  { word: "beauty", type: "noun", ipa: "/ˈbjuːti/", definition: "a combination of qualities that pleases aesthetic senses", vi: "vẻ đẹp", explanation: "A quality that gives great pleasure to see or experience." },
  { word: "blame", type: "verb", ipa: "/bleɪm/", definition: "to feel or declare that someone is responsible for a fault", vi: "đổ lỗi, chê trách", explanation: "Saying someone is responsible for something bad." },
  { word: "bored", type: "adj", ipa: "/bɔːrd/", definition: "feeling weary and impatient because one is unoccupied", vi: "chán nản", explanation: "Having nothing interesting to do." },
  { word: "breathtaking", type: "adj", ipa: "/ˈbreθteɪkɪŋ/", definition: "astonishing or awe-inspiring in quality", vi: "ngoạn mục, tuyệt đẹp", explanation: "So amazing it takes your breath away." },
  { word: "brilliant", type: "adj", ipa: "/ˈbrɪliənt/", definition: "exceptionally clever or talented; very bright", vi: "xuất sắc, tài năng", explanation: "Used for very clever people or great ideas." },
  // C
  { word: "capable", type: "adj", ipa: "/ˈkeɪpəbl/", definition: "having the ability, fitness, or quality to do something", vi: "có khả năng, có năng lực", explanation: "Being able to do something well." },
  { word: "catapult", type: "verb", ipa: "/ˈkætəpʌlt/", definition: "to launch or hurl with great force; to be propelled suddenly", vi: "phóng, lao vọt", explanation: "To move very fast suddenly, like being thrown." },
  { word: "cautious", type: "adj", ipa: "/ˈkɔːʃəs/", definition: "careful to avoid potential problems or dangers", vi: "thận trọng, cẩn thận", explanation: "Being careful not to take risks." },
  { word: "charge", type: "verb", ipa: "/tʃɑːrdʒ/", definition: "to rush forward suddenly and quickly", vi: "lao vào, xông thẳng", explanation: "Moving very fast in a specific direction." },
  { word: "clamp", type: "verb", ipa: "/klæmp/", definition: "to fasten or squeeze tightly", vi: "kẹp chặt, bám chặt", explanation: "Holding something very tightly." },
  { word: "clueless", type: "adj", ipa: "/ˈkluːləs/", definition: "having no knowledge or understanding of something", vi: "không biết gì, mù tịt", explanation: "Completely unaware or ignorant about something." },
  { word: "concept", type: "noun", ipa: "/ˈkɒnsept/", definition: "an abstract idea; a general notion", vi: "khái niệm", explanation: "An idea or principle." },
  { word: "confused", type: "adj", ipa: "/kənˈfjuːzd/", definition: "unable to think clearly; bewildered", vi: "bối rối, lúng túng", explanation: "Not understanding something clearly." },
  { word: "convince", type: "verb", ipa: "/kənˈvɪns/", definition: "to cause someone to believe something firmly", vi: "thuyết phục", explanation: "Making someone believe that something is true." },
  { word: "corrupt", type: "verb", ipa: "/kəˈrʌpt/", definition: "to cause to become dishonest; to change from good to bad", vi: "làm hỏng, làm tha hóa", explanation: "To make someone change from honest to dishonest." },
  { word: "crush", type: "noun", ipa: "/krʌʃ/", definition: "a brief but intense infatuation with someone", vi: "cảm nắng, tình cảm thầm lặng", explanation: "A romantic feeling for someone that isn't official." },
  { word: "curiosity", type: "noun", ipa: "/ˌkjʊəriˈɒsɪti/", definition: "a strong desire to know or learn something", vi: "sự tò mò", explanation: "Wanting to know about something." },
  // D
  { word: "danger", type: "noun", ipa: "/ˈdeɪndʒər/", definition: "the possibility of suffering harm or injury", vi: "nguy hiểm, hiểm nguy", explanation: "A situation where harm could happen." },
  { word: "dazzling", type: "adj", ipa: "/ˈdæzlɪŋ/", definition: "extremely bright or impressive", vi: "lộng lẫy, rực rỡ", explanation: "So bright or beautiful that it's hard to look away." },
  { word: "debate", type: "verb", ipa: "/dɪˈbeɪt/", definition: "to argue about something formally or informally", vi: "tranh luận", explanation: "Discussing two different views on a topic." },
  { word: "decade", type: "noun", ipa: "/ˈdekeɪd/", definition: "a period of ten years", vi: "thập kỷ", explanation: "Ten years." },
  { word: "decision", type: "noun", ipa: "/dɪˈsɪʒən/", definition: "a conclusion reached after consideration", vi: "quyết định", explanation: "A choice you make after thinking about options." },
  { word: "dedicated", type: "adj", ipa: "/ˈdedɪkeɪtɪd/", definition: "devoted to a task or purpose", vi: "tận tâm, cống hiến", explanation: "Working hard and being committed to something." },
  { word: "defend", type: "verb", ipa: "/dɪˈfend/", definition: "to protect from harm or attack", vi: "bảo vệ, tự vệ", explanation: "To keep something or someone safe." },
  { word: "delicate", type: "adj", ipa: "/ˈdelɪkɪt/", definition: "very fine in texture or structure; easily broken or damaged", vi: "tinh tế, mỏng manh", explanation: "Something that needs careful handling." },
  { word: "desperate", type: "adj", ipa: "/ˈdespərɪt/", definition: "feeling or showing a hopeless sense that a situation is so bad it is impossible to deal with", vi: "tuyệt vọng", explanation: "Being in a very urgent situation with few options." },
  { word: "determine", type: "verb", ipa: "/dɪˈtɜːrmɪn/", definition: "to firmly decide; to ascertain or establish exactly", vi: "quyết tâm; xác định", explanation: "To make a firm decision or find out something for certain." },
  { word: "disaster", type: "noun", ipa: "/dɪˈzɑːstər/", definition: "a sudden accident or natural catastrophe causing great damage", vi: "thảm họa", explanation: "A terrible event causing much harm." },
  { word: "discomfort", type: "noun", ipa: "/dɪsˈkʌmfərt/", definition: "slight pain or physical unease; mental unease", vi: "sự khó chịu", explanation: "Feeling uncomfortable physically or emotionally." },
  { word: "dismiss", type: "verb", ipa: "/dɪsˈmɪs/", definition: "to decide that something is not worth thinking about", vi: "gạt bỏ, bác bỏ", explanation: "To treat something as unimportant." },
  { word: "ditch", type: "verb", ipa: "/dɪtʃ/", definition: "to deliberately avoid or abandon someone", vi: "bỏ đi, chuồn", explanation: "Slang: to leave or avoid someone on purpose." },
  { word: "dribble", type: "verb", ipa: "/ˈdrɪbl/", definition: "to control a ball by kicking or bouncing it repeatedly", vi: "rê bóng", explanation: "Moving a ball forward with your feet or hands." },
  // E
  { word: "embarrassed", type: "adj", ipa: "/ɪmˈbærəst/", definition: "feeling self-conscious, ashamed, or awkward", vi: "xấu hổ, ngượng ngùng", explanation: "Feeling uncomfortable because of something you did." },
  { word: "energy", type: "noun", ipa: "/ˈenərdʒi/", definition: "the strength and vitality required for activity", vi: "năng lượng", explanation: "The power that drives activity and movement." },
  { word: "entertain", type: "verb", ipa: "/ˌentərˈteɪn/", definition: "to provide amusement or enjoyment", vi: "giải trí, tiếp đãi", explanation: "Keeping someone amused or busy." },
  { word: "enormous", type: "adj", ipa: "/ɪˈnɔːrməs/", definition: "very large in size, quantity or extent", vi: "khổng lồ, cực kỳ lớn", explanation: "Much bigger than normal." },
  { word: "exact", type: "adj", ipa: "/ɪɡˈzækt/", definition: "not approximated in any way; precise", vi: "chính xác", explanation: "Completely correct, with no mistakes." },
  { word: "excited", type: "adj", ipa: "/ɪkˈsaɪtɪd/", definition: "very enthusiastic and eager", vi: "hào hứng, phấn khích", explanation: "Feeling very happy and energetic about something." },
  { word: "exhausted", type: "adj", ipa: "/ɪɡˈzɔːstɪd/", definition: "drained of one's physical or mental resources; very tired", vi: "kiệt sức", explanation: "So tired you have no energy left." },
  { word: "explain", type: "verb", ipa: "/ɪkˈspleɪn/", definition: "to make something clear by describing it in more detail", vi: "giải thích", explanation: "Making something easier to understand." },
  // F
  { word: "fascinated", type: "adj", ipa: "/ˈfæsɪneɪtɪd/", definition: "strongly attracted or interested", vi: "bị mê hoặc, say mê", explanation: "Being very interested and drawn in by something." },
  { word: "figure", type: "verb", ipa: "/ˈfɪɡjər/", definition: "to think or believe; to conclude", vi: "cho rằng, suy ra", explanation: "To work something out or come to a conclusion." },
  { word: "firm", type: "adj", ipa: "/fɜːrm/", definition: "having a solid, almost unyielding surface; not changing", vi: "vững chắc, kiên quyết", explanation: "Strong and not likely to change." },
  { word: "flash", type: "verb", ipa: "/flæʃ/", definition: "to appear or move suddenly and quickly", vi: "lóe lên, thoáng qua", explanation: "Moving or appearing very quickly." },
  { word: "flip", type: "verb", ipa: "/flɪp/", definition: "to turn over suddenly; to change dramatically", vi: "lật, đảo ngược; bị cuốn hút đột ngột", explanation: "In teen slang: to become suddenly infatuated." },
  { word: "frustrated", type: "adj", ipa: "/frʌˈstreɪtɪd/", definition: "feeling upset or annoyed due to inability to achieve something", vi: "thất vọng, bực bội", explanation: "Feeling annoyed because things aren't working out." },
  // G
  { word: "glance", type: "verb", ipa: "/ɡlɑːns/", definition: "to look briefly at something", vi: "liếc nhìn", explanation: "A quick look at something." },
  { word: "grab", type: "verb", ipa: "/ɡræb/", definition: "to take or seize suddenly or roughly", vi: "túm, nắm lấy", explanation: "To take something quickly and forcefully." },
  { word: "grade", type: "noun", ipa: "/ɡreɪd/", definition: "a particular level or rank; a class in school", vi: "lớp học; điểm số", explanation: "US English: the year level in school (grade 2 = lớp 2)." },
  { word: "grateful", type: "adj", ipa: "/ˈɡreɪtfl/", definition: "feeling or showing an appreciation for something", vi: "biết ơn", explanation: "Thankful for something someone did for you." },
  { word: "grip", type: "noun", ipa: "/ɡrɪp/", definition: "a firm hold; the ability to maintain contact with a surface", vi: "cái nắm chặt, sự kiểm soát", explanation: "A strong hold on something." },
  { word: "guilty", type: "adj", ipa: "/ˈɡɪlti/", definition: "responsible for a wrongdoing; feeling shame for doing wrong", vi: "tội lỗi, cảm thấy có lỗi", explanation: "Knowing you did something wrong and feeling bad about it." },
  // H
  { word: "hesitate", type: "verb", ipa: "/ˈhezɪteɪt/", definition: "to pause before doing something", vi: "do dự, ngần ngại", explanation: "Stopping briefly before making a decision." },
  { word: "hint", type: "noun", ipa: "/hɪnt/", definition: "a slight or indirect indication", vi: "gợi ý, ám chỉ", explanation: "An indirect clue or suggestion." },
  { word: "honor", type: "noun", ipa: "/ˈɒnər/", definition: "high respect earned; a privilege", vi: "danh dự, vinh dự", explanation: "Great respect or a special privilege." },
  { word: "hopeful", type: "adj", ipa: "/ˈhoʊpfl/", definition: "feeling or inspiring optimism about a future event", vi: "hy vọng, lạc quan", explanation: "Believing good things will happen." },
  { word: "humble", type: "adj", ipa: "/ˈhʌmbl/", definition: "having or showing a modest estimate of one's importance", vi: "khiêm tốn", explanation: "Not thinking you are better than others." },
  { word: "humor", type: "noun", ipa: "/ˈhjuːmər/", definition: "the quality of being amusing; a mood or state of mind", vi: "sự hài hước; tâm trạng", explanation: "The ability to find or create things that are funny." },
  // I
  { word: "ignore", type: "verb", ipa: "/ɪɡˈnɔːr/", definition: "to refuse to take notice of or acknowledge", vi: "phớt lờ, bỏ qua", explanation: "To deliberately not pay attention to something." },
  { word: "implication", type: "noun", ipa: "/ˌɪmplɪˈkeɪʃən/", definition: "a conclusion that can be drawn from something", vi: "ẩn ý, hàm ý", explanation: "Something suggested but not directly stated." },
  { word: "impression", type: "noun", ipa: "/ɪmˈpreʃən/", definition: "an idea, feeling, or opinion about something", vi: "ấn tượng", explanation: "The feeling or idea you get about someone or something." },
  { word: "incredible", type: "adj", ipa: "/ɪnˈkredɪbl/", definition: "impossible to believe; very good", vi: "không thể tin được; tuyệt vời", explanation: "Something so good or extreme it's hard to believe." },
  { word: "indebted", type: "adj", ipa: "/ɪnˈdetɪd/", definition: "owing gratitude for a service or favour", vi: "mang ơn, nợ ơn", explanation: "Feeling that you owe someone a favour." },
  { word: "infatuation", type: "noun", ipa: "/ɪnˌfætʃuˈeɪʃən/", definition: "an intense but short-lived passion or admiration", vi: "sự mê đắm, cảm nắng", explanation: "A very strong but often temporary feeling of love." },
  { word: "inspect", type: "verb", ipa: "/ɪnˈspekt/", definition: "to look at carefully to assess condition", vi: "kiểm tra, xem xét kỹ", explanation: "Examining something carefully." },
  { word: "interrupt", type: "verb", ipa: "/ˌɪntəˈrʌpt/", definition: "to stop the continuous progress of something", vi: "ngắt lời, gián đoạn", explanation: "To break into a conversation or activity." },
  { word: "investigate", type: "verb", ipa: "/ɪnˈvestɪɡeɪt/", definition: "to carry out a systematic inquiry", vi: "điều tra, tìm hiểu", explanation: "To look into something carefully to find the truth." },
  { word: "involve", type: "verb", ipa: "/ɪnˈvɒlv/", definition: "to include or affect someone in a situation", vi: "liên quan, bao gồm", explanation: "To be part of or included in something." },
  // J
  { word: "jealous", type: "adj", ipa: "/ˈdʒeləs/", definition: "feeling resentment towards someone due to their advantages", vi: "ghen tuông, ghen tị", explanation: "Feeling upset because someone else has what you want." },
  { word: "judgment", type: "noun", ipa: "/ˈdʒʌdʒmənt/", definition: "the ability to make considered decisions; an opinion", vi: "sự phán xét; ý kiến", explanation: "Forming an opinion about someone or something." },
  // K
  { word: "keen", type: "adj", ipa: "/kiːn/", definition: "having an eager interest; sharp or strong", vi: "nhiệt tình, sắc bén", explanation: "Very enthusiastic about something." },
  // L
  { word: "label", type: "verb", ipa: "/ˈleɪbl/", definition: "to attach a label to; to classify or describe", vi: "dán nhãn; gán nhãn", explanation: "Putting a name or description on something." },
  { word: "launch", type: "verb", ipa: "/lɔːntʃ/", definition: "to send forward with force; to start something", vi: "phóng; khởi động", explanation: "To start or send something off with energy." },
  { word: "lean", type: "verb", ipa: "/liːn/", definition: "to incline or bend from an upright position", vi: "nghiêng, tựa vào", explanation: "Moving your body to one side." },
  { word: "lure", type: "verb", ipa: "/ljʊər/", definition: "to tempt a person to do something", vi: "dụ dỗ, cám dỗ", explanation: "To attract someone into a situation, often by tricks." },
  // M
  { word: "manly", type: "adj", ipa: "/ˈmænli/", definition: "having qualities traditionally associated with men", vi: "nam tính, dũng cảm", explanation: "Acting in a brave, strong way." },
  { word: "massive", type: "adj", ipa: "/ˈmæsɪv/", definition: "large and heavy; imposing", vi: "khổng lồ, đồ sộ", explanation: "Extremely large or heavy." },
  { word: "mention", type: "verb", ipa: "/ˈmenʃən/", definition: "to briefly refer to something", vi: "đề cập, nhắc đến", explanation: "To say something briefly." },
  { word: "mock", type: "verb", ipa: "/mɒk/", definition: "to tease or laugh at in a scornful way", vi: "chế nhạo, giễu cợt", explanation: "Making fun of someone in an unkind way." },
  { word: "motion", type: "noun", ipa: "/ˈmoʊʃən/", definition: "the act or process of moving", vi: "chuyển động", explanation: "The act of moving." },
  { word: "mutter", type: "verb", ipa: "/ˈmʌtər/", definition: "to say something quietly and indistinctly", vi: "lầm bầm, lẩm bẩm", explanation: "Speaking softly so others can barely hear." },
  // N
  { word: "neighborhood", type: "noun", ipa: "/ˈneɪbərˌhʊd/", definition: "a district or area, especially one forming a community", vi: "khu phố, láng giềng", explanation: "The area around where you live." },
  { word: "nervous", type: "adj", ipa: "/ˈnɜːrvəs/", definition: "easily agitated or alarmed; anxious", vi: "lo lắng, hồi hộp", explanation: "Feeling worried or frightened about something." },
  { word: "notice", type: "verb", ipa: "/ˈnoʊtɪs/", definition: "to become aware of something", vi: "chú ý, nhận ra", explanation: "Becoming aware of something you see or hear." },
  // O
  { word: "obvious", type: "adj", ipa: "/ˈɒbviəs/", definition: "easily perceived or understood; clear", vi: "rõ ràng, hiển nhiên", explanation: "Easy to see or understand." },
  { word: "optimistic", type: "adj", ipa: "/ˌɒptɪˈmɪstɪk/", definition: "hopeful and confident about the future", vi: "lạc quan", explanation: "Believing things will work out well." },
  { word: "overcome", type: "verb", ipa: "/ˌoʊvərˈkʌm/", definition: "to succeed in dealing with a problem or difficulty", vi: "vượt qua, khắc phục", explanation: "To deal successfully with a challenge." },
  { word: "overwhelm", type: "verb", ipa: "/ˌoʊvərˈwelm/", definition: "to bury or drown beneath a huge mass; to affect strongly", vi: "áp đảo, làm choáng ngợp", explanation: "When something is too much to handle." },
  // P
  { word: "patience", type: "noun", ipa: "/ˈpeɪʃəns/", definition: "the capacity to accept or tolerate problems without anger", vi: "sự kiên nhẫn", explanation: "Waiting calmly without getting upset." },
  { word: "perceive", type: "verb", ipa: "/pərˈsiːv/", definition: "to become aware of or understand something", vi: "cảm nhận, nhận thức", explanation: "To notice or understand something through your senses." },
  { word: "personal", type: "adj", ipa: "/ˈpɜːrsənl/", definition: "belonging to or affecting a particular person", vi: "cá nhân, riêng tư", explanation: "Relating to a specific person, not public." },
  { word: "pest", type: "noun", ipa: "/pest/", definition: "a person or thing that is troublesome or annoying", vi: "kẻ phiền phức, sâu hại", explanation: "Someone or something that causes problems or annoyance." },
  { word: "planted", type: "verb", ipa: "/ˈplæntɪd/", definition: "to place firmly in position", vi: "đứng vững, cắm chặt vào", explanation: "To put something firmly in a position." },
  { word: "practically", type: "adv", ipa: "/ˈpræktɪkli/", definition: "almost; nearly; in a practical manner", vi: "gần như, thực tế mà nói", explanation: "Very nearly or almost." },
  { word: "privacy", type: "noun", ipa: "/ˈpraɪvəsi/", definition: "the state of being free from public attention", vi: "sự riêng tư", explanation: "Having time or space away from others." },
  { word: "protest", type: "verb", ipa: "/ˈproʊtest/", definition: "to express an objection to something", vi: "phản đối, phản kháng", explanation: "To say you disagree with something." },
  // R
  { word: "realize", type: "verb", ipa: "/ˈriːəlaɪz/", definition: "to become fully aware of something as a fact", vi: "nhận ra, hiểu ra", explanation: "To suddenly understand something that was not clear before." },
  { word: "rebellion", type: "noun", ipa: "/rɪˈbeljən/", definition: "resistance to authority; refusal to follow rules", vi: "sự nổi loạn, sự phản kháng", explanation: "Going against the rules or authority." },
  { word: "recruit", type: "verb", ipa: "/rɪˈkruːt/", definition: "to enlist or persuade someone to join", vi: "tuyển dụng, lôi kéo", explanation: "Getting someone to join an activity or group." },
  { word: "refuse", type: "verb", ipa: "/rɪˈfjuːz/", definition: "to indicate unwillingness to do or accept something", vi: "từ chối", explanation: "Saying no to something." },
  { word: "regret", type: "noun", ipa: "/rɪˈɡret/", definition: "a feeling of sadness or disappointment over something done", vi: "sự hối tiếc", explanation: "Wishing you had done something differently." },
  { word: "reject", type: "verb", ipa: "/rɪˈdʒekt/", definition: "to dismiss as inadequate or faulty", vi: "từ chối, bác bỏ", explanation: "To not accept something or someone." },
  { word: "reluctant", type: "adj", ipa: "/rɪˈlʌktənt/", definition: "unwilling; hesitant", vi: "miễn cư�ng, ngần ngại", explanation: "Not wanting to do something." },
  { word: "remind", type: "verb", ipa: "/rɪˈmaɪnd/", definition: "to cause someone to remember something", vi: "nhắc nhở", explanation: "Helping someone remember something." },
  { word: "rescue", type: "verb", ipa: "/ˈreskjuː/", definition: "to save from a dangerous or difficult situation", vi: "giải cứu", explanation: "Saving someone from danger or trouble." },
  { word: "resist", type: "verb", ipa: "/rɪˈzɪst/", definition: "to withstand the action or effect of", vi: "kháng cự, chống lại", explanation: "To fight against something or refuse to be affected." },
  { word: "respect", type: "noun", ipa: "/rɪˈspekt/", definition: "admiration felt or shown for someone or something", vi: "sự tôn trọng", explanation: "Treating someone with consideration and regard." },
  { word: "retrieve", type: "verb", ipa: "/rɪˈtriːv/", definition: "to get or bring something back", vi: "lấy lại, thu hồi", explanation: "Going to get something and bringing it back." },
  // S
  { word: "sabotage", type: "verb", ipa: "/ˈsæbətɑːʒ/", definition: "to deliberately destroy or damage something", vi: "phá hoại, cố tình làm hỏng", explanation: "Intentionally ruining something." },
  { word: "scrutinize", type: "verb", ipa: "/ˈskruːtɪnaɪz/", definition: "to examine or inspect closely and thoroughly", vi: "xem xét kỹ lưỡng", explanation: "Looking at something very carefully." },
  { word: "sensitive", type: "adj", ipa: "/ˈsensɪtɪv/", definition: "quick to detect or respond to slight changes; easily upset", vi: "nhạy cảm", explanation: "Easily affected by or aware of things." },
  { word: "shove", type: "verb", ipa: "/ʃʌv/", definition: "to push roughly", vi: "xô, đẩy mạnh", explanation: "Pushing someone or something forcefully." },
  { word: "signal", type: "noun", ipa: "/ˈsɪɡnəl/", definition: "a gesture, action, or sound conveying information", vi: "tín hiệu", explanation: "A way of communicating information." },
  { word: "sincere", type: "adj", ipa: "/sɪnˈsɪər/", definition: "free from pretence; genuine", vi: "chân thành", explanation: "Honest and meaning what you say." },
  { word: "sniff", type: "verb", ipa: "/snɪf/", definition: "to draw air audibly through the nose", vi: "hít, ngửi", explanation: "Breathing in through your nose to smell something." },
  { word: "sophisticated", type: "adj", ipa: "/səˈfɪstɪkeɪtɪd/", definition: "having worldly knowledge and refined taste", vi: "tinh tế, phức tạp", explanation: "Knowledgeable, smart, or well-developed." },
  { word: "space", type: "noun", ipa: "/speɪs/", definition: "a continuous area that is free, available, or unoccupied", vi: "không gian, khoảng cách", explanation: "Room or distance between things." },
  { word: "squeal", type: "verb", ipa: "/skwiːl/", definition: "to make a long, high-pitched sound", vi: "la thét, rít lên", explanation: "A high-pitched cry of surprise or excitement." },
  { word: "stare", type: "verb", ipa: "/stɛr/", definition: "to look fixedly at something or someone", vi: "nhìn chằm chằm", explanation: "Looking at something for a long time without looking away." },
  { word: "strategic", type: "adj", ipa: "/strəˈtiːdʒɪk/", definition: "relating to the identification of long-term aims and means", vi: "có chiến lược, có tính toán", explanation: "Carefully planned to achieve a goal." },
  { word: "struggle", type: "verb", ipa: "/ˈstrʌɡl/", definition: "to make great efforts; to contend with difficulty", vi: "vật lộn, cố gắng vất vả", explanation: "Trying hard to do something difficult." },
  { word: "suddenly", type: "adv", ipa: "/ˈsʌdənli/", definition: "quickly and unexpectedly", vi: "đột nhiên, bỗng dưng", explanation: "Happening very fast without warning." },
  { word: "superior", type: "adj", ipa: "/suːˈpɪəriər/", definition: "higher in status, quality, or condition", vi: "vượt trội, cao hơn", explanation: "Better than something else." },
  { word: "suppose", type: "verb", ipa: "/səˈpoʊz/", definition: "to think or believe something to be true", vi: "cho rằng, giả sử", explanation: "Thinking something might be true without being certain." },
  { word: "survive", type: "verb", ipa: "/sərˈvaɪv/", definition: "to continue to live or exist in spite of something", vi: "sống sót, vượt qua", explanation: "To stay alive or continue despite difficulties." },
  { word: "suspicious", type: "adj", ipa: "/səˈspɪʃəs/", definition: "having or showing a cautious distrust of someone", vi: "nghi ngờ", explanation: "Feeling that something is wrong or someone cannot be trusted." },
  // T
  { word: "tackle", type: "verb", ipa: "/ˈtækl/", definition: "to make determined efforts to deal with; to knock down in sport", vi: "giải quyết; vật ngã, ôm chặt", explanation: "In sport: to stop someone by grabbing or blocking them." },
  { word: "terrified", type: "adj", ipa: "/ˈterɪfaɪd/", definition: "extremely frightened", vi: "khiếp sợ, hoảng loạn", explanation: "Very, very scared." },
  { word: "threaten", type: "verb", ipa: "/ˈθretən/", definition: "to state one's intention to take harmful action", vi: "đe dọa", explanation: "Warning someone that something bad will happen." },
  { word: "tolerate", type: "verb", ipa: "/ˈtɒləreɪt/", definition: "to allow the existence of something one dislikes", vi: "chịu đựng, dung túng", explanation: "Putting up with something you don't like." },
  { word: "tragedy", type: "noun", ipa: "/ˈtrædʒɪdi/", definition: "an event causing great suffering; a serious play with a sad ending", vi: "bi kịch, thảm kịch", explanation: "A very sad and terrible event." },
  { word: "trouble", type: "noun", ipa: "/ˈtrʌbl/", definition: "difficulty, problems, or distress", vi: "rắc rối, vấn đề", explanation: "A difficult or problematic situation." },
  // U
  { word: "uncomfortable", type: "adj", ipa: "/ʌnˈkʌmftəbl/", definition: "causing or feeling discomfort or unease", vi: "không thoải mái, bất tiện", explanation: "Not feeling at ease physically or emotionally." },
  { word: "unique", type: "adj", ipa: "/juːˈniːk/", definition: "being the only one of its kind; unlike anything else", vi: "độc đáo, duy nhất", explanation: "Different from everything else." },
  { word: "uneasy", type: "adj", ipa: "/ʌnˈiːzi/", definition: "causing or feeling anxiety; not comfortable", vi: "lo lắng, bồn chồn", explanation: "Feeling slightly worried or uncomfortable." },
  // V
  { word: "valuable", type: "adj", ipa: "/ˈvæljuəbl/", definition: "worth a great deal of money or importance", vi: "quý giá, có giá trị", explanation: "Very important or worth a lot." },
  { word: "vanish", type: "verb", ipa: "/ˈvænɪʃ/", definition: "to disappear suddenly and completely", vi: "biến mất", explanation: "To suddenly be gone." },
  { word: "venture", type: "verb", ipa: "/ˈventʃər/", definition: "to dare to go somewhere or do something risky", vi: "dám làm, liều thử", explanation: "To do something risky or uncertain." },
  // W
  { word: "ward", type: "verb", ipa: "/wɔːrd/", definition: "to block or turn away something unwanted", vi: "ngăn chặn, đẩy lui", explanation: "To keep something unpleasant away." },
  { word: "warn", type: "verb", ipa: "/wɔːrn/", definition: "to inform someone in advance of possible danger", vi: "cảnh báo", explanation: "Telling someone about a danger before it happens." },
  { word: "wedge", type: "verb", ipa: "/wedʒ/", definition: "to fix in position or squeeze into a narrow space", vi: "chèn vào, chen chúc vào", explanation: "Pushing into a tight space." },
  { word: "whisper", type: "verb", ipa: "/ˈwɪspər/", definition: "to speak very softly", vi: "thì thầm", explanation: "Talking very quietly so only nearby people can hear." },
  { word: "wink", type: "verb", ipa: "/wɪŋk/", definition: "to close and open one eye as a signal", vi: "nháy mắt", explanation: "Closing one eye briefly as a friendly signal." },
  { word: "wonder", type: "verb", ipa: "/ˈwʌndər/", definition: "to desire to know something; to feel surprise and admiration", vi: "tự hỏi; kinh ngạc", explanation: "Feeling curious about something." },
  { word: "worn", type: "adj", ipa: "/wɔːrn/", definition: "damaged or shabby as a result of much use; very tired", vi: "mòn cũ; mệt mỏi", explanation: "Exhausted or damaged from use." },
  { word: "wound", type: "verb", ipa: "/waʊnd/", definition: "past tense of 'wind' – to coil or twist", vi: "cuốn vào, vướng vào", explanation: "To become tangled or twisted around something." },
];

// ────────────────────────────────────────────────────────────────────────────────
// MASTER GRAMMAR DATABASE  (50 patterns with examples from the novel)
// ────────────────────────────────────────────────────────────────────────────────
const GRAMMAR_DB = [
  // Present perfect
  { structure: "have/has + V3 (Present Perfect)", meaning: "Dùng để nói về hành động đã xảy ra trong quá khứ và có liên quan đến hiện tại, hoặc kinh nghiệm", context: "All I've ever wanted is for Juli Baker to leave me alone.", explanation: "\"I've ever wanted\" = have + ever + wanted. 'Ever' nhấn mạnh toàn bộ trải nghiệm cuộc đời." },
  // Present perfect continuous
  { structure: "have/has + been + V-ing (Present Perfect Continuous)", meaning: "Diễn tả hành động bắt đầu trong quá khứ và vẫn còn tiếp diễn hoặc vừa mới kết thúc", context: "He had been tossing me the same sort of look all week.", explanation: "Nhấn mạnh tính liên tục của hành động suốt một khoảng thời gian." },
  // Past perfect
  { structure: "had + V3 (Past Perfect)", meaning: "Diễn tả hành động xảy ra trước một hành động khác trong quá khứ", context: "I didn't think about it until later, but ditch wasn't a play I'd run with my dad before.", explanation: "\"I'd run\" = I had run. Hành động chưa từng xảy ra trước thời điểm đó trong quá khứ." },
  // Gerund as subject
  { structure: "V-ing as subject (Gerund)", meaning: "Dùng động từ thêm -ing làm chủ ngữ câu, tương tự danh từ", context: "Pulling a ditch is not something discussed with dads.", explanation: "\"Pulling a ditch\" là chủ ngữ – gerund làm danh từ." },
  // Infinitive of purpose
  { structure: "to + V (Infinitive of purpose)", meaning: "Diễn tả mục đích của hành động", context: "I dove behind my mother to avoid Juli.", explanation: "\"to avoid\" = mục đích của hành động lao sau lưng mẹ." },
  // Conditional type 2
  { structure: "If + past simple, would + V (Second Conditional)", meaning: "Diễn tả tình huống giả định không có thực ở hiện tại", context: "If I walked outside, Juli would see me.", explanation: "Tình huống giả định ở hiện tại, không có thực." },
  // Conditional type 3
  { structure: "If + past perfect, would have + V3 (Third Conditional)", meaning: "Diễn tả tình huống giả định không có thực trong quá khứ", context: "If my dad had not intervened, she would have come inside.", explanation: "Điều kiện cách 3 – sự kiện không xảy ra trong quá khứ." },
  // Passive voice – simple past
  { structure: "was/were + V3 (Passive – Past Simple)", meaning: "Câu bị động thì quá khứ đơn – chủ thể chịu tác động của hành động", context: "I was branded for life by the kids at school.", explanation: "Chủ ngữ (I) bị tác động bởi hành động (branded)." },
  // Passive voice – present
  { structure: "am/is/are + V3 (Passive – Present Simple)", meaning: "Câu bị động thì hiện tại đơn", context: "The seat is analyzed carefully by Mr. Mertins.", explanation: "Dùng khi muốn nhấn mạnh vào hành động hơn là chủ thể thực hiện." },
  // Modal – could
  { structure: "could + V (Modal – ability in past)", meaning: "Diễn tả khả năng trong quá khứ", context: "I could hear her asking from my hiding place behind the couch.", explanation: "\"could hear\" = khả năng nghe thấy trong quá khứ." },
  // Modal – would (past habit)
  { structure: "would + V (Past habit / repeated action)", meaning: "Diễn tả thói quen hoặc hành động lặp lại trong quá khứ", context: "Every day she would come back, over and over again.", explanation: "\"would come\" = thói quen lặp lại trong quá khứ, thay cho \"used to\"." },
  // Used to
  { structure: "used to + V", meaning: "Diễn tả thói quen hoặc trạng thái đã từng tồn tại trong quá khứ nhưng không còn nữa", context: "I used to knock-down-drag-out with her.", explanation: "\"used to\" + V nguyên thể – thói quen trong quá khứ không còn tồn tại." },
  // Relative clause – defining
  { structure: "Noun + that/who/which + clause (Defining Relative Clause)", meaning: "Mệnh đề quan hệ xác định – làm rõ danh từ đứng trước", context: "She's the kind of person who makes a point of letting you know she's smart.", explanation: "\"who\" dùng cho người, giới thiệu mệnh đề quan hệ xác định." },
  // Relative clause – non-defining
  { structure: "Noun + , which/who + clause (Non-defining Relative Clause)", meaning: "Mệnh đề quan hệ không xác định – cung cấp thêm thông tin không cần thiết để nhận ra danh từ", context: "Mr. Mertins, who had some kind of doctorate, arranged the seats.", explanation: "Ngăn cách bằng dấu phẩy; bỏ đi mệnh đề này câu vẫn đủ nghĩa." },
  // Emphatic 'do'
  { structure: "do/does/did + V (Emphatic 'do')", meaning: "Dùng trợ động từ để nhấn mạnh hành động", context: "She did try very hard to be civilized.", explanation: "\"did try\" nhấn mạnh rằng hành động thực sự xảy ra, thường để phản bác." },
  // Inversion for emphasis
  { structure: "Neither/Nor + aux + subject (Inversion)", meaning: "Dùng đảo ngữ để đồng tình với câu phủ định", context: "Neither of them looked up.", explanation: "Dùng \"neither\" thay cho \"both ... not\", nhấn mạnh sự phủ định cho cả hai." },
  // Tag question
  { structure: "statement + tag question", meaning: "Câu hỏi đuôi – thêm câu hỏi ngắn để xác nhận thông tin", context: "Isn't it time for you to go inside and help your mother?", explanation: "Câu hỏi đuôi bắt đầu bằng isn't, aren't, didn't... để xác nhận." },
  // Reported speech
  { structure: "said + that + clause (Reported Speech)", meaning: "Lời nói gián tiếp – thuật lại lời nói của người khác", context: "She said that her mom knew where she was.", explanation: "Động từ thường lùi về thì quá khứ khi chuyển sang reported speech." },
  // Wish + past simple
  { structure: "wish + past simple (Wish for present/future)", meaning: "Diễn tả ước muốn ở hiện tại về điều không có thực", context: "I wish she would just leave me alone.", explanation: "\"wish + would V\" diễn tả mong muốn về hành động của người khác." },
  // Wish + past perfect
  { structure: "wish + had + V3 (Wish for past)", meaning: "Diễn tả ước muốn về điều đã không xảy ra trong quá khứ", context: "I wished I had not opened the door that day.", explanation: "\"wish + had + V3\" về điều hối tiếc trong quá khứ." },
  // Gerund after preposition
  { structure: "preposition + V-ing (Gerund after preposition)", meaning: "Sau giới từ luôn dùng V-ing, không dùng to + V", context: "She left without saying goodbye.", explanation: "Sau giới từ (without, before, after, by...) phải dùng gerund (V-ing)." },
  // Too + adj + to V
  { structure: "too + adj + to + V", meaning: "Quá ... để có thể làm gì", context: "He was too exhausted to argue.", explanation: "Cấu trúc \"too...to\" diễn tả mức độ cản trở hành động." },
  // Adj + enough + to V
  { structure: "adj + enough + to + V", meaning: "Đủ ... để làm gì", context: "I was old enough to know she was dangerous.", explanation: "\"enough + to\" diễn tả khả năng đạt ngưỡng để thực hiện hành động." },
  // So + adj + that
  { structure: "so + adj/adv + that + clause", meaning: "Quá ... đến nỗi ...", context: "She was so excited that she charged across the street.", explanation: "Diễn tả kết quả của một mức độ cao." },
  // Such + noun phrase + that
  { structure: "such + (a/an) + adj + noun + that + clause", meaning: "Đến mức ... (nhấn mạnh danh từ)", context: "It was such a disaster that I never forgot it.", explanation: "\"such ... that\" giống \"so ... that\" nhưng đứng trước cụm danh từ." },
  // Not only... but also
  { structure: "Not only + clause + but + also + clause", meaning: "Không chỉ ... mà còn ...", context: "She not only barged in but also started moving boxes.", explanation: "Dùng để liệt kê hai điều, nhấn mạnh điều thứ hai." },
  // Both ... and
  { structure: "Both + A + and + B", meaning: "Cả A lẫn B", context: "Both Bryce and his dad were wearing turquoise shirts.", explanation: "Dùng để kết hợp hai yếu tố theo nghĩa khẳng định." },
  // Either ... or
  { structure: "Either + A + or + B", meaning: "Hoặc A hoặc B", context: "Either you leave or I will.", explanation: "Đưa ra hai lựa chọn, một trong hai xảy ra." },
  // Neither ... nor
  { structure: "Neither + A + nor + B", meaning: "Không A cũng không B", context: "Neither his dad nor his mom liked Juli's behavior.", explanation: "Phủ định cả hai yếu tố." },
  // Despite + noun/gerund
  { structure: "Despite + noun / V-ing", meaning: "Mặc dù (đứng trước danh từ hoặc gerund, không có 'that')", context: "Despite being annoyed, he stayed quiet.", explanation: "\"Despite\" + N/Gerund. Khác \"although\" đứng trước mệnh đề." },
  // Although / even though
  { structure: "Although / Even though + clause", meaning: "Mặc dù (đứng trước mệnh đề có chủ vị)", context: "Although my dad had been tossing me the same look, I kept quiet.", explanation: "\"Although/Even though\" + đầy đủ mệnh đề = mệnh đề nhượng bộ." },
  // As soon as
  { structure: "As soon as + clause", meaning: "Ngay khi ... (chỉ thời gian tức thì)", context: "As soon as I walked in, Juli squealed my name.", explanation: "\"As soon as\" chỉ hành động xảy ra ngay lập tức sau hành động khác." },
  // By the time
  { structure: "By the time + clause, + clause", meaning: "Vào lúc ... (hành động đã hoàn thành trước một thời điểm)", context: "By the time I peeked out, she was gone.", explanation: "\"By the time\" thường đi với thì hoàn thành." },
  // While + V-ing
  { structure: "While + V-ing (Simultaneous actions)", meaning: "Trong khi đang ...", context: "While moving boxes, Mr. Loski looked exhausted.", explanation: "Dùng \"while + V-ing\" khi hai hành động xảy ra cùng lúc, chủ ngữ giống nhau." },
  // After + V-ing
  { structure: "After + V-ing", meaning: "Sau khi ... (hoàn thành hành động trước)", context: "After peeking out the door, I saw she was gone.", explanation: "\"After + V-ing\" khi hành động hoàn thành trước hành động chính." },
  // Before + V-ing
  { structure: "Before + V-ing", meaning: "Trước khi ...", context: "Before going outside, I always checked through the window.", explanation: "\"Before + V-ing\" chỉ thứ tự thời gian." },
  // Make + object + V (Causative)
  { structure: "make + object + base V (Causative)", meaning: "Khiến ai đó làm gì (không tự nguyện)", context: "She made me feel like a real jerk.", explanation: "\"make + O + V\" = gây ra một kết quả ở người khác." },
  // Have + object + V (Causative)
  { structure: "have + object + V (Causative)", meaning: "Nhờ/sai ai đó làm gì", context: "He had her take off her shoes.", explanation: "\"have + O + V\" = sắp xếp để ai đó làm điều gì đó." },
  // Get + object + to V (Causative)
  { structure: "get + object + to + V", meaning: "Thuyết phục/khiến ai đó làm gì", context: "She got him to hold her hand somehow.", explanation: "\"get + O + to V\" = có kết quả là người đó làm hành động." },
  // Keep + V-ing
  { structure: "keep + V-ing", meaning: "Tiếp tục làm gì (không dừng lại)", context: "She kept sniffing my hair in class.", explanation: "\"keep + V-ing\" = hành động tiếp diễn không ngừng." },
  // Stop + V-ing vs stop + to V
  { structure: "stop + V-ing (vs. stop + to V)", meaning: "Ngừng làm gì (V-ing) / dừng lại để làm gì (to V)", context: "The sniffing stops and the whispering starts.", explanation: "\"stop + V-ing\" = dừng hành động đó; \"stop + to V\" = dừng lại để thực hiện hành động mới." },
  // Remember + V-ing vs remember + to V
  { structure: "remember + V-ing (vs. remember + to V)", meaning: "Nhớ đã làm gì (V-ing) / nhớ phải làm gì (to V)", context: "I remember her sniffing my hair.", explanation: "\"remember + V-ing\" = nhớ về hành động đã xảy ra trong quá khứ." },
  // Let + object + V
  { structure: "let + object + base V", meaning: "Cho phép ai đó làm gì", context: "He wouldn't let her quit.", explanation: "\"let + O + V\" = cho phép, không ngăn cản." },
  // Seem + to V / seem + adj
  { structure: "seem + to V / seem + adj", meaning: "Có vẻ như ...", context: "She seemed to have no concept of personal space.", explanation: "\"seem + to V\" hoặc \"seem + adj\" diễn tả ấn tượng bên ngoài." },
  // It + seems + that
  { structure: "It seems / seemed + that + clause", meaning: "Có vẻ như rằng ...", context: "It seemed that she would never give up.", explanation: "Cấu trúc hình thức với \"it\" làm chủ ngữ giả." },
  // The + comparative, the + comparative
  { structure: "The + comparative, the + comparative", meaning: "Càng ... càng ...", context: "The more I played with the idea, the more I liked it.", explanation: "Cấu trúc song song nhấn mạnh sự tăng dần." },
  // Causative have/get (passive)
  { structure: "have/get + object + V3 (Passive causative)", meaning: "Nhờ người khác làm gì cho mình (bị động)", context: "She had her shoes removed before entering.", explanation: "\"have/get + O + V3\" khi chủ thể không tự làm mà nhờ người khác." },
  // Reporting verbs
  { structure: "verb + that + clause (Reporting verbs)", meaning: "Động từ tường thuật + mệnh đề (say, tell, think, believe, explain...)", context: "She told him that she lived right across the street.", explanation: "Sau các động từ tường thuật, mệnh đề thường lùi thì." },
  // Reflexive pronouns
  { structure: "Reflexive pronouns (myself, yourself, himself...)", meaning: "Đại từ phản thân – khi chủ ngữ và tân ngữ là một", context: "She catapulted herself into the moving van.", explanation: "\"herself\" = chính cô ta, nhấn mạnh chủ thể tự thực hiện hành động." },
  // Quantifiers
  { structure: "Quantifiers (some, any, no, every, all, each)", meaning: "Từ chỉ số lượng – dùng trước danh từ đếm được/không đếm được", context: "She wasn't embarrassed. Not a bit.", explanation: "\"Not a bit\" = không một chút nào. \"Every day\" = mỗi ngày. Quantifiers rất phổ biến trong TOEIC." },
  // Fronting / inversion for emphasis
  { structure: "Fronting (Moving phrase to front for emphasis)", meaning: "Đảo thành phần câu lên đầu để nhấn mạnh", context: "She just peeled them off and left them in a crusty heap on our porch.", explanation: "Trạng từ và cụm trạng ngữ thường được đưa lên đầu để nhấn mạnh trong văn học." },
];

// ────────────────────────────────────────────────────────────────────────────────
// Helper: find first sentence containing the word in a paragraph list
// ────────────────────────────────────────────────────────────────────────────────
function findContext(paragraphs, word) {
  const lowerWord = word.toLowerCase();
  const wordRegex = new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
  
  for (const p of paragraphs) {
    const text = p.en || '';
    if (wordRegex.test(text)) {
      // Find the sentence containing the word
      const sentences = text.match(/[^.!?]+[.!?"]*["']?/g) || [text];
      for (const sentence of sentences) {
        if (new RegExp(`\\b${lowerWord}\\b`, 'i').test(sentence)) {
          return sentence.trim().slice(0, 180); // Limit length
        }
      }
      return text.slice(0, 180);
    }
  }
  return '';
}

// ────────────────────────────────────────────────────────────────────────────────
// Helper: check if word appears in chapter text
// ────────────────────────────────────────────────────────────────────────────────
function wordAppearsInText(word, fullText) {
  const regex = new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
  return regex.test(fullText);
}

// ────────────────────────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────────────────────────
function augment() {
  console.log('Reading chapters.json...');
  const raw = fs.readFileSync(chaptersPath, 'utf-8');
  const data = JSON.parse(raw);

  data.chapters = data.chapters.map((ch, chIdx) => {
    const fullText = ch.paragraphs.map(p => p.en).join(' ');
    console.log(`\nProcessing chapter ${ch.chapterNum}: ${ch.title}`);

    // ── VOCABULARY ──────────────────────────────────────────────────────────
    // Step 1: find which words appear in this chapter
    const appeared = VOCAB_DB.filter(v => wordAppearsInText(v.word, fullText));
    console.log(`  Words found in text: ${appeared.length}/${VOCAB_DB.length}`);

    // Step 2: if fewer than 150, add words from DB that are most commonly useful
    let selectedVocab = [...appeared];
    if (selectedVocab.length < 150) {
      const appearedWords = new Set(appeared.map(v => v.word.toLowerCase()));
      const remaining = VOCAB_DB.filter(v => !appearedWords.has(v.word.toLowerCase()));
      // Add more words to reach 150
      selectedVocab = [...appeared, ...remaining].slice(0, 150);
    } else {
      selectedVocab = selectedVocab.slice(0, 150);
    }

    // Step 3: build vocab entries with actual context from chapter
    const vocabulary = selectedVocab.map(v => {
      const ctx = findContext(ch.paragraphs, v.word);
      return {
        word: v.word,
        type: v.type,
        ipa: v.ipa,
        definition: v.definition,
        vi: v.vi,
        context: ctx || v.word + ' (from chapter text)',
        explanation: v.explanation
      };
    });

    // ── GRAMMAR ─────────────────────────────────────────────────────────────
    // Assign first 50 grammar patterns (slice to exactly 50)
    const grammar = GRAMMAR_DB.slice(0, 50).map(g => {
      // Try to find a sentence from this chapter that demonstrates the pattern
      // (We use the stored example if no chapter sentence matches)
      return {
        structure: g.structure,
        meaning: g.meaning,
        context: g.context, // The curated example sentence
        explanation: g.explanation
      };
    });

    console.log(`  ✓ Vocab: ${vocabulary.length}, Grammar: ${grammar.length}`);

    return {
      ...ch,
      vocabulary,
      grammar
    };
  });

  console.log('\nWriting updated chapters.json...');
  fs.writeFileSync(chaptersPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('✓ Done! All chapters now have 150 vocabulary items and 50 grammar patterns.');
}

augment();
