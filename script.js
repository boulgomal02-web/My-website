// ربط العناصر
const levelSelect = document.getElementById("level");
const subjectSelect = document.getElementById("subject");
const wilayaSelect = document.getElementById("wilaya");
const showPostBtn = document.getElementById("showPost");
const postContainer = document.getElementById("postContainer");
const userPosts = document.getElementById("userPosts");

// المواد حسب الأطوار
const subjectsByLevel = {
  primary: ["اللغة العربية", "اللغة الفرنسية", "اللغة الإنجليزية", "التربية البدنية"],
  middle: ["الرياضيات", "اللغة العربية", "اللغة الفرنسية", "اللغة الإنجليزية", "العلوم الطبيعية", "العلوم الفيزيائية", "التاريخ والجغرافيا", "التربية الإسلامية", "التربية البدنية"],
  secondary: ["الرياضيات", "اللغة العربية", "اللغة الفرنسية", "اللغة الإنجليزية", "العلوم الطبيعية", "العلوم الفيزيائية", "الفلسفة", "التاريخ والجغرافيا", "الاقتصاد", "الإعلام الآلي", "التربية الإسلامية", "التربية البدنية"]
};

// نظام التصفية
let currentFilter = 'all';

// حفظ المنشورات في localStorage
let postsData = JSON.parse(localStorage.getItem('postsData')) || [];

// منشورات جاهزة
const presetPosts = [
  { wilaya: "خنشلة", level: "middle", subject: "التربية البدنية", content: "ششار متوسطة إبراهيمي صالح يوجد منصب استخلاف لاستاذ تربية تشكيلية وفنية (رسم) لمدة 150 يوم" },
  { wilaya: "بومرداس", level: "secondary", subject: "اللغة الفرنسية", content: "بودواو ثانوية زقور محمد بن العربي بن مرزوقة استخلاف على عطلة امومة مادة اللغة الفرنسية" },
  { wilaya: "المدية", level: "secondary", subject: "الإنجليزية", content: "ثانوية الأخوين جغدلي تابلاط وجود منصب استخلاف لمادة الانجليزية (عطلة مرضية) شهر قابل للتجديد" },
  { wilaya: "باتنة", level: "secondary", subject: "الإعلام الآلي", content: "ثانوية زواكري عمار رأس العيون استخلاف في مادة الإعلام الآلي لمدة شهر" }
];

// عند تغيير الطور → تحديث قائمة المواد
levelSelect.addEventListener("change", function() {
  subjectSelect.innerHTML = '<option value="">-- اختر المادة --</option>';
  const selectedLevel = this.value;
  if (subjectsByLevel[selectedLevel]) {
    subjectsByLevel[selectedLevel].forEach(subj => {
      const option = document.createElement("option");
      option.value = subj;
      option.textContent = subj;
      subjectSelect.appendChild(option);
    });
  }
});

// عرض المنشور عند الضغط على الزر
showPostBtn.addEventListener("click", function() {
  const wilaya = wilayaSelect.value;
  const level = levelSelect.value;
  const subject = subjectSelect.value;

  if (!wilaya || !level || !subject) {
    postContainer.innerHTML = "<p style='color:red;'>الرجاء اختيار الولاية والطور والمادة.</p>";
    return;
  }

  postContainer.innerHTML = `
    <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; background: #f9f9f9;">
      <h3><i class="fas fa-bullhorn" style="color:gold;"></i> منشور خاص بولاية ${wilaya}</h3>
      <p><strong>التاريخ:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>الطور:</strong> ${level}</p>
      <p><strong>المادة:</strong> ${subject}</p>
      <p><strong>المكان:</strong> ${wilaya}</p>
      <button id="requestBtn" style="margin-top:10px; padding:8px 15px; background:green; color:white; border:none; border-radius:5px; cursor:pointer;">
        <i class="fas fa-paper-plane"></i> إيداع طلب استخلاف
      </button>
      <button id="notifyBtn" style="margin-top:10px; margin-left:5px; padding:8px 15px; background:blue; color:white; border:none; border-radius:5px; cursor:pointer;">
        <i class="fas fa-bell"></i> إخبار بوجود منصب
      </button>
      <button id="showPresetBtn" style="margin-top:10px; margin-left:5px; padding:8px 15px; background:purple; color:white; border:none; border-radius:5px; cursor:pointer;">
        إظهار المنشورات الجاهزة
      </button>
    </div>
  `;

  document.getElementById("requestBtn").addEventListener("click", () => openTextBox(wilaya, subject));
  document.getElementById("notifyBtn").addEventListener("click", () => openTextBox(wilaya, subject));
  document.getElementById("showPresetBtn").addEventListener("click", () => addPresetPosts(wilaya, level, subject));
});

// فتح مربع كتابة منشور
function openTextBox(wilaya, subject) {
  const textBox = document.createElement("div");
  textBox.style.marginTop = "10px";
  textBox.innerHTML = `
    <textarea id="postText" rows="3" style="width:100%; padding:8px;" placeholder="اكتب منشورك هنا (ممنوع وضع رقم الهاتف أو الإيميل أو الروابط)"></textarea>
    <button id="publishBtn" style="margin-top:5px; padding:6px 12px; background:orange; color:white; border:none; border-radius:5px; cursor:pointer;">
      نشر
    </button>
  `;
  postContainer.appendChild(textBox);

  document.getElementById("publishBtn").addEventListener("click", function() {
      const content = document.getElementById("postText").value.trim();
      if (!content) return alert("الرجاء كتابة محتوى المنشور.");
      publishPost(wilaya, subject, content);
  });
}

// نشر المنشور وحفظه
function publishPost(wilaya, subject, content) {
  if (/\d/.test(content) || /\S+@\S+\.\S+/.test(content) || /(http|https):\/\/\S+/.test(content)) {
      alert("ممنوع إدخال رقم الهاتف أو البريد الإلكتروني أو الروابط!");
      return;
  }

  const postId = Date.now();
  const newPost = { id: postId, wilaya, subject, content, replies: [], date: new Date().toLocaleString() };
  postsData.unshift(newPost);
  localStorage.setItem('postsData', JSON.stringify(postsData));

  renderPosts();
  document.getElementById("postText").value = "";
}

// إضافة المنشورات الجاهزة
function addPresetPosts(wilaya, level, subject) {
  presetPosts.forEach(p => {
    if (p.wilaya === wilaya && p.level === level && p.subject === subject) {
      const postId = Date.now() + Math.random();
      const newPost = { id: postId, wilaya: p.wilaya, subject: p.subject, content: p.content, replies: [], date: new Date().toLocaleString() };
      postsData.unshift(newPost);
    }
  });
  localStorage.setItem('postsData', JSON.stringify(postsData));
  renderPosts();
}

// ----------- نظام الردود المتداخلة + تعديل وحذف -----------
function addReplyRecursive(targetReplies) {
  const replyText = prompt("اكتب ردك:");
  if (!replyText || replyText.trim() === "") return;
  if (/\d/.test(replyText) || /\S+@\S+\.\S+/.test(replyText) || /(http|https):\/\/\S+/.test(replyText)) {
      alert("ممنوع إدخال رقم الهاتف أو البريد الإلكتروني أو الروابط!");
      return;
  }
  const reply = { text: replyText, date: new Date().toLocaleString(), replies: [] };
  targetReplies.push(reply);
  localStorage.setItem('postsData', JSON.stringify(postsData));
  renderPosts();
}

function editReply(reply) {
  const newText = prompt("عدل الرد:", reply.text);
  if (!newText || newText.trim() === "") return;
  if (/\d/.test(newText) || /\S+@\S+\.\S+/.test(newText) || /(http|https):\/\/\S+/.test(newText)) {
      alert("ممنوع إدخال رقم الهاتف أو البريد الإلكتروني أو الروابط!");
      return;
  }
  reply.text = newText;
  localStorage.setItem('postsData', JSON.stringify(postsData));
  renderPosts();
}

function deleteReply(repliesArray, index) {
  if (!confirm("هل أنت متأكد أنك تريد حذف هذا الرد؟")) return;
  repliesArray.splice(index, 1);
  localStorage.setItem('postsData', JSON.stringify(postsData));
  renderPosts();
}

// ----------- عرض المنشورات والردود recursively -----------
function renderReplies(replies, container, parentArray) {
  replies.forEach((reply, index) => {
    const replyDiv = document.createElement("div");
    replyDiv.style.margin = "5px 0 5px 20px";
    replyDiv.style.padding = "5px";
    replyDiv.style.background = "#f1f1f1";
    replyDiv.style.borderRadius = "5px";

    replyDiv.innerHTML = `<p>${reply.text}</p><small>${reply.date}</small> 
      <button class="replyOnReplyBtn">رد</button>
      <button class="editReplyBtn">تعديل</button>
      <button class="deleteReplyBtn">حذف</button>`;

    replyDiv.querySelector(".replyOnReplyBtn").addEventListener("click", () => addReplyRecursive(reply.replies));
    replyDiv.querySelector(".editReplyBtn").addEventListener("click", () => editReply(reply));
    replyDiv.querySelector(".deleteReplyBtn").addEventListener("click", () => deleteReply(parentArray, index));

    container.appendChild(replyDiv);

    if (reply.replies.length > 0) {
      renderReplies(reply.replies, replyDiv, reply.replies);
    }
  });
}

function editPost(post) {
  const newContent = prompt("عدل المنشور:", post.content);
  if (!newContent || newContent.trim() === "") return;
  if (/\d/.test(newContent) || /\S+@\S+\.\S+/.test(newContent) || /(http|https):\/\/\S+/.test(newContent)) {
    alert("ممنوع إدخال رقم الهاتف أو البريد الإلكتروني أو الروابط!");
    return;
  }
  post.content = newContent;
  localStorage.setItem('postsData', JSON.stringify(postsData));
  renderPosts();
}

function deletePost(postId) {
  if (!confirm("هل أنت متأكد أنك تريد حذف هذا المنشور؟")) return;
  postsData = postsData.filter(p => p.id !== postId);
  localStorage.setItem('postsData', JSON.stringify(postsData));
  renderPosts();
}

function renderPosts() {
  userPosts.innerHTML = "";
  postsData.forEach(post => {
    const postDiv = document.createElement("div");
    postDiv.classList.add("postBox");
    postDiv.setAttribute("data-id", post.id);
    postDiv.style.border = "1px solid #ddd";
    postDiv.style.padding = "10px";
    postDiv.style.marginTop = "10px";
    postDiv.style.borderRadius = "8px";
    postDiv.style.background = "#fff";

    postDiv.innerHTML = `
      <p class="postContent">${post.content}</p>
      <small>${post.date}</small>
      <small style="margin-right:10px; color:gray;"> | ولاية: ${post.wilaya}</small><br>
      <button class="replyBtn">رد</button>
      <button class="editPostBtn">تعديل</button>
      <button class="deletePostBtn">حذف</button>
      <div class="replies"></div>
    `;

    postDiv.querySelector(".replyBtn").addEventListener("click", () => addReplyRecursive(post.replies));
    postDiv.querySelector(".editPostBtn").addEventListener("click", () => editPost(post));
    postDiv.querySelector(".deletePostBtn").addEventListener("click", () => deletePost(post.id));

    renderReplies(post.replies, postDiv.querySelector(".replies"), post.replies);
    userPosts.appendChild(postDiv);
  });

  applyPostFilter();
}

// ----------- التصفية -----------
document.addEventListener('DOMContentLoaded', () => {
  renderPosts();
});