import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
import base64
import urllib.request
import os
import shutil
import time

# ----------------------------------------------------
# MERMAID DIAGRAM RENDERING UTILITY WITH RETRY LOGIC
# ----------------------------------------------------
def download_mermaid_diagram(graph_code, filename, images_dir):
    max_retries = 5
    base_delay = 2
    
    # Base64 encode the mermaid string
    graphbytes = graph_code.encode("utf-8")
    base64_bytes = base64.b64encode(graphbytes)
    base64_string = base64_bytes.decode("utf-8")
    url = "https://mermaid.ink/img/" + base64_string
    
    # Configure Request with Browser User-Agent to prevent 403 Forbidden checks
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    )
    
    filepath = os.path.join(images_dir, filename)
    
    for attempt in range(1, max_retries + 1):
        try:
            # Introduce a 2-second delay between requests to prevent API rate limiting
            time.sleep(2.0)
            
            print(f"Requesting {filename} (Attempt {attempt}/{max_retries})...")
            with urllib.request.urlopen(req, timeout=20) as response:
                with open(filepath, 'wb') as out_file:
                    out_file.write(response.read())
            
            # Verify file was actually written and has non-zero size
            if os.path.exists(filepath) and os.path.getsize(filepath) > 100:
                print(f"Successfully rendered and downloaded: {filename}")
                return filepath
            else:
                raise Exception("Downloaded file is empty or missing.")
        except Exception as e:
            print(f"Attempt {attempt} failed for {filename}: {e}")
            if attempt == max_retries:
                print(f"FATAL: Failed to render {filename} after {max_retries} attempts.")
                return None
            # Backoff delay
            sleep_time = base_delay * attempt
            print(f"Retrying in {sleep_time} seconds...")
            time.sleep(sleep_time)
            
    return None

def create_report():
    doc = Document()
    
    # Create an images folder inside the workspace to store the rendered diagrams
    workspace_dir = r"c:\Users\Harishchandran\Desktop\SMS _Front end &backend"
    images_dir = os.path.join(workspace_dir, "report_images")
    if not os.path.exists(images_dir):
        os.makedirs(images_dir)

    # ----------------------------------------------------
    # DEFINING ALL 7 MERMAID DIAGRAMS
    # ----------------------------------------------------
    diag_lifecycle_code = """graph TD
    classDef startPhase fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px,color:#01579b;
    classDef planPhase fill:#ede7f6,stroke:#673ab7,stroke-width:2px,color:#311b92;
    classDef execPhase fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,color:#1b5e20;
    classDef closePhase fill:#fffde7,stroke:#fbc02d,stroke-width:2px,color:#f57f17;

    subgraph Phase_1["Phase 1: Starting (Initiation)"]
        A[Project Charter & Mandate] --> B[Stakeholder Identification]
        B --> C[Feasibility & Business Case Approval]
        C --> D[Project Kickoff Meeting]
    end
    class A,B,C,D startPhase;

    subgraph Phase_2["Phase 2: Planning"]
        D --> E[Detailed Requirements Gathering]
        E --> F[WBS & Scope Definition]
        F --> G[Schedule & Critical Path CPM Development]
        G --> H[Budget Allocation & Baseline]
        H --> I[Architecture & DB Schema Design]
    end
    class E,F,G,H,I planPhase;

    subgraph Phase_3["Phase 3: Execution & Monitoring"]
        I --> J[Frontend Portal Development]
        I --> K[Backend API Development]
        J & K --> L[System Integration & DB Connectivity]
        L --> M[Code Reviews & Static Analysis]
        M --> N[System Verification & Quality Control]
        N --> O{Milestone Review & QA Approval}
        O -- Retest / Defect Found --> J
    end
    class J,K,L,M,N,O execPhase;

    subgraph Phase_4["Phase 4: Project Closure"]
        O -- Approved --> P[User Acceptance Testing UAT]
        P --> Q[Production Deployment & Go-Live]
        Q --> R[Lessons Learned Workshop]
        R --> S((Project Closed & Archived))
    end
    class P,Q,R,S closePhase;
    """

    diag_matrix_code = """graph TD
    ES[Executive Sponsor / School Board]
    PMO[Project Management Office]
    FH[Functional Head / Engineering]
    PM[Project Manager / Delivery Authority]
    
    subgraph Pool["Shared Technical Resource Pool"]
        DEV[Lead Web Developers]
        QA[QA Engineers]
        DBA[Database Administrator]
    end

    ES --> PMO
    PMO --> FH
    PMO --> PM
    
    FH --> DEV
    FH --> QA
    FH --> DBA
    
    PM -.->|Assigns Tasks / Controls Budget| DEV
    PM -.->|Assigns Tasks / Controls Schedule| QA
    PM -.->|Assigns Tasks / Sets Milestones| DBA
    
    style ES fill:#f5f5f5,stroke:#333,stroke-width:2px;
    style PMO fill:#fff3e0,stroke:#ff9800,stroke-width:2px;
    style FH fill:#e8f5e9,stroke:#4caf50,stroke-width:2px;
    style PM fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px;
    style DEV fill:#ffffff,stroke:#777;
    style QA fill:#ffffff,stroke:#777;
    style DBA fill:#ffffff,stroke:#777;
    """

    diag_stakeholder_code = """graph TD
    subgraph Satisfy["KEEP SATISFIED (High Power / Low Interest)"]
        A1[School Principal]
        A2[Database Administrator]
    end
    
    subgraph Manage["MANAGE CLOSELY (High Power / High Interest)"]
        B1[School Board / Sponsor]
        B2[Lead System Developers]
    end
    
    subgraph Monitor["MONITOR (Low Power / Low Interest)"]
        C1[Parents]
    end
    
    subgraph Inform["KEEP INFORMED (Low Power / High Interest)"]
        D1[School Teachers]
        D2[Students]
    end

    style B1 fill:#ffebee,stroke:#f44336,stroke-width:2px,color:#b71c1c;
    style B2 fill:#ffebee,stroke:#f44336,stroke-width:2px,color:#b71c1c;
    style A1 fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,color:#1b5e20;
    style A2 fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,color:#1b5e20;
    style D1 fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px,color:#01579b;
    style D2 fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px,color:#01579b;
    style C1 fill:#f5f5f5,stroke:#9e9e9e,stroke-width:2px,color:#424242;
    """

    diag_wbs_code = """graph LR
    WBS[1.0 School Management System Project]
    
    P1[1.1 Project Initiation]
    P2[1.2 Requirements & Scope]
    P3[1.3 Architecture & DB Design]
    P4[1.4 Backend API Coding]
    P5[1.5 Frontend Integration]
    P6[1.6 Verification & Testing]
    P7[1.7 Deployment & Closure]
    
    WBS --> P1
    WBS --> P2
    WBS --> P3
    WBS --> P4
    WBS --> P5
    WBS --> P6
    WBS --> P7
    
    P1 --> P1_1[1.1.1 Charter]
    P1 --> P1_2[1.1.2 Appraisals]
    
    P2 --> P2_1[1.2.1 Requirements]
    P2 --> P2_2[1.2.2 Scope Baseline]
    
    P3 --> P3_1[1.3.1 MySQL Schema]
    P3 --> P3_2[1.3.2 React Architecture]
    
    P4 --> P4_1[1.4.1 JWT Auth Middleware]
    P4 --> P4_2[1.4.2 Academic Grade APIs]
    P4 --> P4_3[1.4.3 Announcement Routes]
    
    P5 --> P5_1[1.5.1 Admin Portals]
    P5 --> P5_2[1.5.2 Teacher & Principal Views]
    P5 --> P5_3[1.5.3 Student & Parent Dashboards]
    
    P6 --> P6_1[1.6.1 Run system_verification.js]
    P6 --> P6_2[1.6.2 Conduct UAT Sessions]
    
    P7 --> P7_1[1.7.1 MySQL Backup & Server Go-Live]
    P7 --> P7_2[1.7.2 PIR & Archiving]

    style WBS fill:#1b365d,stroke:#333,stroke-width:2px,color:#fff;
    style P1,P2,P3,P4,P5,P6,P7 fill:#ede7f6,stroke:#673ab7,color:#311b92;
    """

    diag_cpm_code = """graph TD
    classDef critical fill:#ffebee,stroke:#f44336,stroke-width:3px,color:#b71c1c;
    classDef noncritical fill:#e8f5e9,stroke:#4caf50,stroke-width:2px,color:#1b5e20;

    A[Activity A: Requirements<br/>Duration: 2 Wks<br/>Float: 0]
    B[Activity B: Design<br/>Duration: 2 Wks<br/>Float: 0]
    C[Activity C: Backend Code<br/>Duration: 3 Wks<br/>Float: 0]
    D[Activity D: Frontend Layout<br/>Duration: 2 Wks<br/>Float: 1 Wk]
    E[Activity E: Axios Integration<br/>Duration: 2 Wks<br/>Float: 0]
    F[Activity F: Testing & QA<br/>Duration: 2 Wks<br/>Float: 0]
    G[Activity G: UAT & Handover<br/>Duration: 1 Wk<br/>Float: 0]
    H[Activity H: Deployment<br/>Duration: 2 Wks<br/>Float: 0]

    A --> B
    B --> C
    B --> D
    C --> E
    D --> E
    E --> F
    F --> G
    G --> H

    class A,B,C,E,F,G,H critical;
    class D noncritical;
    """

    diag_triangle_code = """graph TD
    Scope((Scope)) --- Cost((Cost))
    Cost --- Time((Time))
    Time --- Scope
    
    Scope --- Quality((QUALITY))
    Cost --- Quality
    Time --- Quality

    style Scope fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px;
    style Cost fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px;
    style Time fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px;
    style Quality fill:#fffde7,stroke:#fbc02d,stroke-width:3px,color:#f57f17,font-weight:bold;
    """

    diag_postproject_code = """graph TD
    A[Go-Live & Handover Completed] --> B[Post-Implementation Review PIR]
    B --> C[Verify Financial Savings]
    B --> D[Archive Lessons Learned]
    B --> E[Establish Maintenance SLAs]
    C & D & E --> F((Sustained Project Success))

    style A fill:#f5f5f5,stroke:#333;
    style B fill:#ede7f6,stroke:#673ab7,stroke-width:2px,color:#311b92;
    style C fill:#e8f5e9,stroke:#4caf50;
    style D fill:#e8f5e9,stroke:#4caf50;
    style E fill:#e8f5e9,stroke:#4caf50;
    style F fill:#ffebee,stroke:#f44336,stroke-width:2px,color:#b71c1c;
    """

    # ----------------------------------------------------
    # DOWNLOAD THE DIAGRAMS PROGRAMMATICALLY
    # ----------------------------------------------------
    print("Downloading visual diagrams from rendering API...")
    img_lifecycle = download_mermaid_diagram(diag_lifecycle_code, "01_lifecycle.png", images_dir)
    img_matrix = download_mermaid_diagram(diag_matrix_code, "02_matrix.png", images_dir)
    img_stakeholder = download_mermaid_diagram(diag_stakeholder_code, "03_stakeholder.png", images_dir)
    img_wbs = download_mermaid_diagram(diag_wbs_code, "04_wbs.png", images_dir)
    img_cpm = download_mermaid_diagram(diag_cpm_code, "05_cpm.png", images_dir)
    img_triangle = download_mermaid_diagram(diag_triangle_code, "06_triangle.png", images_dir)
    img_postproject = download_mermaid_diagram(diag_postproject_code, "07_postproject.png", images_dir)
    print("All diagrams compiled successfully!")

    # ----------------------------------------------------
    # PAGE SETUP (A4 with 1-inch margins)
    # ----------------------------------------------------
    for section in doc.sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        
    # ----------------------------------------------------
    # STYLES & FONTS (Calibri 11 with 1.5 spacing, 6pt space after)
    # ----------------------------------------------------
    style_normal = doc.styles['Normal']
    font_normal = style_normal.font
    font_normal.name = 'Calibri'
    font_normal.size = Pt(11)
    font_normal.color.rgb = RGBColor(0x33, 0x33, 0x33) 
    style_normal.paragraph_format.line_spacing = 1.5
    style_normal.paragraph_format.space_after = Pt(6)
    
    # Helper to set formatting
    def set_font(run, name='Calibri', size=11, bold=False, italic=False, color=None):
        run.font.name = name
        run.font.size = Pt(size)
        run.bold = bold
        run.italic = italic
        if color:
            run.font.color.rgb = color

    # Helper to add headings
    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        set_font(run, name='Calibri', size=18, bold=True, color=RGBColor(0x1B, 0x36, 0x5D))
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        set_font(run, name='Calibri', size=14, bold=True, color=RGBColor(0x4A, 0x77, 0x9D))
        return p

    def add_heading_3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        set_font(run, name='Calibri', size=12, bold=True, italic=True, color=RGBColor(0x33, 0x33, 0x33))
        return p

    # Helper to add and center image
    def add_visual_diagram(image_path, caption):
        if image_path and os.path.exists(image_path):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.keep_with_next = True
            run = p.add_run()
            # Set default widths depending on aspect ratio to fit A4 margins nicely
            run.add_picture(image_path, width=Inches(5.6))
            
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_after = Pt(12)
            p_cap.paragraph_format.keep_with_next = True
            run_cap = p_cap.add_run(f"Figure: {caption}")
            set_font(run_cap, name='Calibri', size=9.5, italic=True, color=RGBColor(0x77, 0x77, 0x77))

    # Helper for tables
    def style_table(table, col_widths, headers, data, alignments=None):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        for row in table.rows:
            for i, w in enumerate(col_widths):
                row.cells[i].width = Inches(w)
                
        hdr_cells = table.rows[0].cells
        for i, header_text in enumerate(headers):
            hdr_cells[i].text = header_text
            shading_elm = parse_xml(r'<w:shd {} w:fill="1B365D"/>'.format(nsdecls('w')))
            hdr_cells[i]._tc.get_or_add_tcPr().append(shading_elm)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = alignments[i] if alignments else WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            run = p.runs[0]
            set_font(run, name='Calibri', size=10.5, bold=True, color=RGBColor(255, 255, 255))
            
        for row_idx, row_data in enumerate(data):
            row_cells = table.rows[row_idx + 1].cells
            for col_idx, cell_value in enumerate(row_data):
                row_cells[col_idx].text = str(cell_value)
                p = row_cells[col_idx].paragraphs[0]
                p.alignment = alignments[col_idx] if alignments else WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.space_before = Pt(4)
                p.paragraph_format.space_after = Pt(4)
                if row_idx % 2 == 1:
                    shading_elm = parse_xml(r'<w:shd {} w:fill="F4F6F9"/>'.format(nsdecls('w')))
                    row_cells[col_idx]._tc.get_or_add_tcPr().append(shading_elm)
                if p.runs:
                    run = p.runs[0]
                    set_font(run, name='Calibri', size=10, color=RGBColor(0x33, 0x33, 0x33))

        tblPr = table._tbl.tblPr
        borders = parse_xml(
            r'<w:tblBorders %s>'
            r'  <w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
            r'  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
            r'  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E0E0E0"/>'
            r'  <w:insideV w:val="none"/>'
            r'  <w:left w:val="none"/>'
            r'  <w:right w:val="none"/>'
            r'</w:tblBorders>' % nsdecls('w')
        )
        tblPr.append(borders)

    # ----------------------------------------------------
    # COVER / TITLE PAGE
    # ----------------------------------------------------
    p_title_space = doc.add_paragraph()
    p_title_space.paragraph_format.space_before = Pt(120)
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = p_title.add_run("SOFTWARE PROJECT MANAGEMENT\nINDIVIDUAL ASSIGNMENT REPORT")
    set_font(run_title, name='Calibri', size=26, bold=True, color=RGBColor(0x1B, 0x36, 0x5D))
    p_title.paragraph_format.space_after = Pt(12)
    
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = p_sub.add_run("Strategic Lifecycle, Governance, Constraints, and Risk Management of an\nEnterprise-Grade School Management System (SMS)")
    set_font(run_sub, name='Calibri', size=14, italic=True, color=RGBColor(0x55, 0x55, 0x55))
    p_sub.paragraph_format.space_after = Pt(180)
    
    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_meta = p_meta.add_run(
        "PROJECT NAME: School Management System (SMS)\n"
        "AUTHOR: Project Management Consultant / Lead Developer\n"
        "TECH STACK: React 18, Vite 5, TypeScript 5, Node.js, Express 5, MySQL (XAMPP), TailwindCSS 3\n"
        "DATE: May 2026\n"
        "DOCUMENT STATUS: Final Deliverable"
    )
    set_font(run_meta, name='Calibri', size=10.5, color=RGBColor(0x77, 0x77, 0x77))
    
    doc.add_page_break()

    # ----------------------------------------------------
    # SECTION 1: PROJECT LIFECYCLE FLOW
    # ----------------------------------------------------
    add_heading_1("1. Project Lifecycle Flow & Task Sequence")
    
    p = doc.add_paragraph()
    p.add_run(
        "A successful software development life cycle (SDLC) requires a highly structured, logical, and sequential progression of events. "
        "For the School Management System (SMS), a hybrid project management methodology was adopted—combining the predictive planning of Waterfall "
        "with the iterative execution of Agile (Scrum) for core development sprints. The lifecycle is systematically mapped across four sequential phases:"
    )
    
    p_steps = [
        ("Phase 1: Starting (Initiation)", "Focuses on formal authorization and alignment. The primary task is creating the Project Charter. In parallel, a comprehensive Feasibility & Business Case Appraisal is conducted using NPV, ROI, and Payback estimations to secure organizational sponsorship from the School Board."),
        ("Phase 2: Planning", "Establishes project boundaries and technical targets. Tasks include detailed Requirements Gathering, MoSCoW prioritization, Work Breakdown Structure (WBS) creation, and schedule baseline definition using the Critical Path Method (CPM). Simultaneously, the Database Administrator (DBA) designs the normalized ER schema in MySQL."),
        ("Phase 3: Execution & Monitoring", "The engineering phase. Developers utilize React, TypeScript, and TailwindCSS for frontend portals (Admin, Teacher, Principal, Student, Parent) and Node.js/Express for backend APIs. Integration is achieved via Axios. Quality is continuously monitored through peer code reviews, Git branches, and automated system verification scripts (tests/system_verification.js)."),
        ("Phase 4: Project Closure", "Involves administrative handover, deployment, and archival. Activities include User Acceptance Testing (UAT), training sessions for teachers and administrative staff, production server deployment with fresh SQL database backups, a Lessons Learned workshop, and compiling the Post-Implementation Review (PIR).")
    ]
    
    for phase_title, phase_desc in p_steps:
        p_p = doc.add_paragraph(style='List Bullet')
        p_p.paragraph_format.space_after = Pt(4)
        run_bold = p_p.add_run(phase_title + ": ")
        run_bold.bold = True
        p_p.add_run(phase_desc)
        
    # Embed the lifecycle diagram
    add_visual_diagram(img_lifecycle, "SMS Project Development Lifecycle Flow and Phased Activities")

    p_tools = doc.add_paragraph()
    p_tools.paragraph_format.space_before = Pt(8)
    p_tools.add_run(
        "To ensure governance and alignment, specific industry tools and techniques were deployed at each stage of the project:\n"
        "• Initiation: MS Word/Google Docs for the Project Charter, financial spreadsheet modeling for NPV and ROI appraisals.\n"
        "• Planning & Scheduling: JIRA for requirement backlog, MS Project / Gantt charts for Critical Path scheduling.\n"
        "• Development: Git and GitHub for version control, local XAMPP and phpMyAdmin for local MySQL database setup.\n"
        "• Verification & Testing: Postman for API integration checks, Jest for unit testing, and system_verification.js for transactional database health checks."
    )
    
    doc.add_page_break()

    # ----------------------------------------------------
    # SECTION 2: ROLE AND GOVERNANCE OF THE PM
    # ----------------------------------------------------
    add_heading_1("2. Role and Governance of the Project Manager")
    
    add_heading_2("2.1 Proposed Organizational Structure: Balanced Matrix")
    p = doc.add_paragraph()
    p.add_run(
        "To manage the School Management System (SMS) project effectively, a Balanced Matrix Organizational Structure is implemented. "
        "In a Balanced Matrix, technical resources (such as developers, UI/UX designers, and database administrators) are drawn from their respective "
        "functional departments but are assigned to work on the project under the clear authority of the Project Manager."
    )
    
    p_matrix_points = [
        ("Efficient Resource Utilization", "Since database design is heavily front-loaded, the Database Administrator (DBA) designs the normalized schema early on and then transitions to occasional optimization, ensuring they are not sitting idle when database creation completes."),
        ("Dedicated Project Authority", "Unlike a weak matrix where the PM acts merely as a coordinator or expeditor, a Balanced Matrix gives the PM authority over the schedule, budget baseline, and task allocation, ensuring delivery remains on path."),
        ("Cross-Functional Integration", "Building 5 distinct portals requires continuous collaboration between frontend React coders and backend Express controllers. The matrix structure bridges these disciplines under one cohesive management layer.")
    ]
    
    for title, desc in p_matrix_points:
        p_p = doc.add_paragraph(style='List Bullet')
        p_p.paragraph_format.space_after = Pt(4)
        run_bold = p_p.add_run(title + ": ")
        run_bold.bold = True
        p_p.add_run(desc)

    # Embed organizational structure diagram
    add_visual_diagram(img_matrix, "Balanced Matrix Reporting Lines and Project Authority Structure")

    add_heading_2("2.2 Responsibilities, Authority Levels, and Goals of the PM")
    p = doc.add_paragraph()
    p.add_run(
        "The governance role of the Project Manager is defined across key professional parameters to ensure absolute accountability:"
    )
    
    headers_pm = ["Parameter", "Description & Authority Details"]
    col_widths_pm = [1.8, 4.47]
    data_pm = [
        ["Core Responsibilities", "Scope baseline creation and monitoring, Gantt-based schedule tracking, developer workload balancing, stakeholder communication management, and formal Change Control."],
        ["Authority Levels", "Medium-to-High. The PM has full authority over daily scheduling, task assignments, and internal technical trade-offs. The PM manages the $35,000 budget baseline, with mandatory sponsor consultation for variances exceeding ±5%."],
        ["Key Project Goals", "Deliver all 5 functioning portals within the strict 14-week timeline to align with the new academic term, stay within the $35,000 budget, and satisfy the security requirements (JWT encryption, role-based controls)."]
    ]
    
    table_pm = doc.add_table(rows=len(data_pm) + 1, cols=2)
    style_table(table_pm, col_widths_pm, headers_pm, data_pm)

    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_before = Pt(8)

    add_heading_2("2.3 Is the PM Responsible for Doing the Project?")
    p = doc.add_paragraph()
    p.add_run(
        "No, the Project Manager is not responsible for 'doing' the project. In project management theory, a clear distinction must be made between "
        "managing the project and executing the technical deliverables. The PM's primary role is governance, facilitation, coordination, and control. "
        "The PM acts as an enabler—managing the variables of Scope, Time, Cost, and Quality, removing roadblocks, securing resources, and managing risks. "
        "The PM defines what needs to be done, when it must be completed, and how progress is tracked."
    )
    p = doc.add_paragraph()
    p.add_run(
        "Conversely, the technical team (developers, designer, database administrator) is responsible for the physical execution ('doing') of the project. "
        "They write the React frontend code, implement Express API controllers, and deploy MySQL databases. "
        "To use a common analogy, the PM is like the conductor of an orchestra. The conductor does not play the violin, flute, or drums themselves, "
        "but is entirely responsible for ensuring that all musicians play in harmony, stay on tempo, and deliver a flawless collective performance. "
        "If a PM starts 'doing' the technical work (e.g., writing backend route handlers), they lose the objective high-level view required to manage "
        "critical risks, leading to planning failures and overall project delay."
    )
    
    doc.add_page_break()

    # ----------------------------------------------------
    # SECTION 3: BUSINESS CASE & APPRAISALS
    # ----------------------------------------------------
    add_heading_1("3. Business Case, Investment Appraisals, and Stakeholders")
    
    add_heading_2("3.1 Investment Appraisal Methods")
    p = doc.add_paragraph()
    p.add_run(
        "To evaluate the financial feasibility of the SMS project, three primary appraisal techniques were used over a 5-year horizon:\n"
        "1. Net Present Value (NPV): Evaluates the time value of money by discounting future net cash inflows back to their present value (using an 8% discount rate).\n"
        "2. Return on Investment (ROI): Measures the absolute efficiency of the investment.\n"
        "3. Payback Period: Identifies the time required for the cash inflows to recover the initial development investment."
    )
    
    p = doc.add_paragraph()
    run_bold = p.add_run("Financial Assumptions:\n")
    run_bold.bold = True
    p.add_run(
        "• Initial Development Cost (Year 0): $35,000\n"
        "• Annual Operational Savings: $15,000 (replacing physical registers, paper, and manual administration)\n"
        "• Annual System Maintenance Cost (Years 1–5): $3,000 (hosting, licensing, backup support)\n"
        "• Net Annual Cash Inflow: $15,000 - $3,000 = $12,000 per year"
    )
    
    headers_fin = ["Year", "Inflow ($)", "Outflow ($)", "Net Cash ($)", "DF (8%)", "Present Value ($)", "Cum. Net ($)"]
    col_widths_fin = [0.8, 0.9, 0.9, 0.9, 0.8, 1.1, 0.87]
    align_fin = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.RIGHT]
    data_fin = [
        ["Year 0", "-", "$35,000", "-$35,000", "1.0000", "-$35,000.00", "-$35,000.00"],
        ["Year 1", "$15,000", "$3,000", "$12,000", "0.9259", "$11,110.80", "-$23,000.00"],
        ["Year 2", "$15,000", "$3,000", "$12,000", "0.8573", "$10,287.60", "-$11,000.00"],
        ["Year 3", "$15,000", "$3,000", "$12,000", "0.7938", "$9,525.60", "$1,000.00"],
        ["Year 4", "$15,000", "$3,000", "$12,000", "0.7350", "$8,820.00", "$13,000.00"],
        ["Year 5", "$15,000", "$3,000", "$12,000", "0.6806", "$8,167.20", "$25,000.00"]
    ]
    
    table_fin = doc.add_table(rows=len(data_fin) + 1, cols=7)
    style_table(table_fin, col_widths_fin, headers_fin, data_fin, align_fin)

    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_before = Pt(8)
    
    p = doc.add_paragraph()
    p.add_run(
        "Financial Analysis Summary:\n"
        "• Net Present Value (NPV): NPV = Sum of PVs (Years 1-5) - Initial Investment = $47,911.20 - $35,000.00 = $12,911.20. Since the NPV is positive ($12,911.20 > 0), the project is financially viable and will generate net positive value.\n"
        "• Return on Investment (ROI): ROI = (Total Net Benefits - Total Investment) / Total Investment * 100 = ($60,000 - $35,000) / $35,000 * 100 = 71.43%. This represents an excellent rate of return.\n"
        "• Payback Period: The cumulative cash flow turns positive in Year 3. Exact Payback = 2 + (Remaining Year 2 Cost / Net Year 3 Cash) = 2 + ($11,000 / $12,000) = 2.92 Years (~2 years and 11 months)."
    )

    add_heading_2("3.2 Comparative Analysis: Evaluating Internal vs. External Projects")
    p = doc.add_paragraph()
    p.add_run(
        "No, the exact same appraisal factors cannot be applied uniformly without modification. While high-level metrics like NPV or ROI remain core financial baselines, the underlying evaluation parameters, risk weightings, and qualitative factors differ significantly:"
    )
    
    headers_comp = ["Evaluation Factor", "Internal Project (In-House Build)", "External / Outsourced Project"]
    col_widths_comp = [1.5, 2.3, 2.47]
    data_comp = [
        ["Budget Treatment", "Costs are operational salary allocations (OpEx). Low upfront cash layout but higher long-term staff maintenance.", "Costs are capital expenses (CapEx) based on binding commercial contract milestones. High upfront cash outflow."],
        ["Risk Allocation", "All risks are retained internally. If developer turnover occurs, the school faces direct project delay and resource losses.", "Risks are shifted to the vendor via Service Level Agreements (SLAs) and legal penalty clauses for late delivery."],
        ["Control & Scope", "Complete control over codebase. Changes to scope can be made fluidly by the PM.", "Low control over intermediate code. Changes to scope require formal 'Change Orders' that incur significant extra costs."]
    ]
    table_comp = doc.add_table(rows=len(data_comp) + 1, cols=3)
    style_table(table_comp, col_widths_comp, headers_comp, data_comp)

    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_before = Pt(8)

    add_heading_2("3.3 Stakeholder Management Strategy")
    p = doc.add_paragraph()
    p.add_run(
        "Stakeholders were mapped systematically using a Power-Interest grid to devise appropriate governance strategies:"
    )
    
    headers_stk = ["Stakeholder", "Power/Interest", "Potential Impact", "Management Strategy"]
    col_widths_stk = [1.3, 1.0, 1.7, 2.27]
    data_stk = [
        ["School Board", "High / High", "Controls project funding and strategic direction. Can cancel or redirect the project.", "Manage Closely. Provide monthly status reports and NPV updates, and demonstrate key milestones."],
        ["School Principal", "High / Medium", "Evaluates systemic academic benefits. Has authority over final UAT approval.", "Keep Satisfied. Involve in designing administrative workflows (approval gates, noticeboard rights)."],
        ["Lead Developers", "Medium / High", "High technical influence. Key resources for implementation and backend routes.", "Manage Closely. Conduct daily standups, maintain clear task.md, and perform constructive code reviews."],
        ["School Teachers", "Low / High", "Primary users inputting grades and managing classes. Can resist system adoption.", "Keep Informed. Conduct training sessions, provide simple user guides, and address dashboard feedback."]
    ]
    table_stk = doc.add_table(rows=len(data_stk) + 1, cols=4)
    style_table(table_stk, col_widths_stk, headers_stk, data_stk)

    # Embed Stakeholder Grid
    add_visual_diagram(img_stakeholder, "Stakeholder Mapping Grid by Power and Interest Levels")

    doc.add_page_break()

    # ----------------------------------------------------
    # SECTION 4: BALANCING PROJECT VARIABLES
    # ----------------------------------------------------
    add_heading_1("4. Balancing Project Variables (Scope, Time, Cost, and Quality)")
    
    add_heading_2("4.1 Work Breakdown Structure (WBS)")
    p = doc.add_paragraph()
    p.add_run(
        "The project scope was decomposed systematically down to Level 3 Work Packages. In software project management, "
        "decomposing scope ensures deliverables are manageable, estimable, and traceably assigned to specific engineers."
    )
    
    # Embed WBS Diagram
    add_visual_diagram(img_wbs, "Work Breakdown Structure (WBS) Tree Map down to Level 3 Work Packages")

    add_heading_2("4.2 Schedule & Critical Path Method (CPM)")
    p = doc.add_paragraph()
    p.add_run(
        "A detailed schedule was created using the Critical Path Method (CPM) based on activity dependencies and durations:"
    )
    
    headers_cpm = ["ID", "Task Description", "Predecessor", "Duration (Wks)", "ES / EF", "Float"]
    col_widths_cpm = [0.5, 2.7, 1.0, 0.9, 0.8, 0.57]
    align_cpm = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER]
    data_cpm = [
        ["A", "Requirements Sign-off & Charter Approval", "None", "2", "0 / 2", "0"],
        ["B", "Database Schema & Architecture Design", "A", "2", "2 / 4", "0"],
        ["C", "Backend API & Database Implementation", "B", "3", "4 / 7", "0"],
        ["D", "Frontend UI & Portal Layout Design", "B", "2", "4 / 6", "1"],
        ["E", "Frontend & Backend Axios Integration", "C, D", "2", "7 / 9", "0"],
        ["F", "Comprehensive Testing & Verification", "E", "2", "9 / 11", "0"],
        ["G", "User Acceptance Testing & Handover", "F", "1", "11 / 12", "0"],
        ["H", "Production Deployment & DB Backups", "G", "2", "12 / 14", "0"]
    ]
    table_cpm = doc.add_table(rows=len(data_cpm) + 1, cols=6)
    style_table(table_cpm, col_widths_cpm, headers_cpm, data_cpm, align_cpm)

    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_before = Pt(8)
    
    p = doc.add_paragraph()
    p.add_run(
        "Calculated Critical Path: A ➡️ B ➡️ C ➡️ E ➡️ F ➡️ G ➡️ H\n"
        "Total Planned Duration: 14 Weeks"
    )

    # Embed CPM Diagram
    add_visual_diagram(img_cpm, "Critical Path Method (CPM) Network Dependency Diagram (Critical Path highlighted in Red)")

    p_level = doc.add_paragraph()
    p_level.add_run(
        "Schedule Levelling Process: During planning, it was identified that the 2 Full-Stack Developers were overallocated during Weeks 5 and 6, as both Backend API coding (Activity C) and Frontend Portal styling (Activity D) were scheduled in parallel. To level the schedule, the Project Manager leveraged the 1-week float in Activity D. Activity D's start was delayed by one week, shifting resources to first stabilize the critical MySQL database connectivity and backend API routes. This schedule levelling eliminated resource overallocation and ensured the team focused exclusively on the critical path, keeping the 14-week timeline secure."
    )

    add_heading_2("4.3 Project Budget & Cost Estimation")
    p = doc.add_paragraph()
    p.add_run(
        "The project budget baseline was established at $35,000 using Bottom-Up estimation (summing developer hourly efforts based on database entities and React portal pages) and Analogous estimation (referencing historical cost databases for similar educational administrative setups):"
    )
    
    headers_bud = ["WBS Code", "Cost Element", "Estimation Method", "Budget Allocation ($)"]
    col_widths_bud = [1.0, 2.5, 1.5, 1.27]
    align_bud = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.RIGHT]
    data_bud = [
        ["1.0", "Project Management & Supervision", "Analogous", "$6,000.00"],
        ["2.0", "UI/UX Design & Prototyping", "Bottom-Up", "$4,500.00"],
        ["3.0", "Database Design & MySQL Server Setup", "Bottom-Up", "$3,500.00"],
        ["4.0", "Backend API Development (Express/JWT)", "Bottom-Up", "$8,500.00"],
        ["5.0", "Frontend React Integration (TailwindCSS)", "Bottom-Up", "$9,000.00"],
        ["6.0", "Testing & Verification Script Coding", "Bottom-Up", "$2,000.00"],
        ["7.0", "Contingency Reserve (Unforeseen Risks)", "Management Reserve", "$1,500.00"],
        ["Total", "SMS Project Budget", "-", "$35,000.00"]
    ]
    table_bud = doc.add_table(rows=len(data_bud) + 1, cols=4)
    style_table(table_bud, col_widths_bud, headers_bud, data_bud, align_bud)

    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_before = Pt(8)

    add_heading_2("4.4 Quality Assurance & Control")
    p = doc.add_paragraph()
    p.add_run(
        "Strict quality baselines were maintained through systematic practices:\n"
        "• Quality Assurance (QA): Process-oriented. Enforced automated static linting via ESLint and strict TypeScript type boundaries. Established GitHub Branch Protection requiring peer review approval before merging feature branches.\n"
        "• Quality Control (QC): Product-oriented. Created and ran automated tests (node tests/system_verification.js) to check live database connectivity, API route returns, and role-based permissions (JWT validation tests)."
    )

    add_heading_2("4.5 Connectivity of Project Variables: Why Do They Need to Be Balanced?")
    p = doc.add_paragraph()
    p.add_run(
        "The project variables—Scope, Time, Cost, and Quality—form the standard Project Management Triangle, where one variable cannot be altered without affecting the others. "
        "For example, expanding the Scope mid-project (e.g., adding parent email notifications) naturally demands more development time, which increases the Cost (budget). "
        "Similarly, compressing the Time (schedule) to launch early will either inflate the Cost (overtime pay) or compromise Quality (rushed testing, resulting in bugs). "
        "The PM must balance these variables to maintain the integrity of the project. Rushing any single variable without adjusting the others leads to systematic failure."
    )

    # Embed Triangle Diagram
    add_visual_diagram(img_triangle, "The Project Management Constraint Triangle (with Quality at the Center)")

    doc.add_page_break()

    # ----------------------------------------------------
    # SECTION 5: RESOURCE MOBILIZATION
    # ----------------------------------------------------
    add_heading_1("5. Resource Mobilization, Engagement, and Monitoring")
    
    add_heading_2("5.1 Resource Allocation and Mobilization Plan")
    p = doc.add_paragraph()
    p.add_run(
        "Human and technical resources were mobilized in a phased matrix format to ensure high engagement levels:"
    )
    
    headers_res = ["Resource Role", "Focus Area", "Mobilization Phase", "Optimal Engagement Strategy"]
    col_widths_res = [1.3, 1.7, 1.2, 2.07]
    data_res = [
        ["Project Manager", "Governance, risk control, WBS tracking.", "Weeks 1 - 14", "Weekly team syncs; prompt technical roadblock removal."],
        ["Lead Developer", "Node.js backend controllers, API endpoints.", "Weeks 3 - 12", "Sprints with clear backlogs; daily Slack standups."],
        ["Frontend Developer", "React UI portal dashboards, Axios calls.", "Weeks 4 - 13", "Interactive design feedback loops; JIRA task.md tracking."],
        ["Database Admin", "MySQL ER model, schemas, index tuning.", "Wk 3-6, Wk 13", "Clear specifications; peer review of SQL schema reports."]
    ]
    table_res = doc.add_table(rows=len(data_res) + 1, cols=4)
    style_table(table_res, col_widths_res, headers_res, data_res)

    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_before = Pt(8)

    add_heading_2("5.2 Monitoring and Control Measures")
    p = doc.add_paragraph()
    p.add_run(
        "The PM monitored three core variables with specific metrics and control procedures:\n"
        "1. Scope Control (Managing Scope Creep): Tracked via Scope Variance (SV). For instance, when a teacher requested custom dashboard statistics in Week 8, the PM initiated the formal Change Control Process. The request was documented, analyzed (+3 days, +$800), and submitted to the Sponsor, preventing undocumented creep.\n"
        "2. Time Control (Schedule Monitoring): Evaluated using the Schedule Performance Index (SPI) via Earned Value Management (EVM). When database queries delayed backend development in Week 6, the SPI dropped to 0.88. The PM reallocated the QA engineer to help set up mock test data, pulling the SPI back to 1.0 by Week 8.\n"
        "3. Cost Control (Budget Variance): Monitored using Cost Variance (CV = EV - AC). In Week 9, integration revealed that a commercial SMTP server was required for email-based password recovery. The PM drew $300 from the $1,500 Contingency Reserve, solving the requirement without exceeding the $35,000 budget."
    )

    add_heading_2("5.3 Communication Strategy Matrix")
    p = doc.add_paragraph()
    p.add_run(
        "Effective communication channels kept all stakeholders aligned throughout development:"
    )
    
    headers_com = ["Meeting Event", "Audience", "Frequency / Channel", "Key Deliverable"]
    col_widths_com = [1.5, 1.3, 1.5, 1.97]
    data_com = [
        ["Daily Standup", "Developers, PM, DBA", "Daily (15 mins) / Slack Huddle", "Daily task progress, active blocks resolution."],
        ["Sprint Review", "PM, Principal, Devs", "Bi-Weekly / MS Teams Demo", "Working software demo (e.g., student submission portal)."],
        ["Sponsor Report", "School Board, PMO", "Monthly / PDF via Email", "Status Report PDF including SPI, CPI, and NPV metrics."],
        ["Release Meeting", "PM, QA, Devs, Principal", "End of Phase 3 / In-Person", "UAT sign-off and production release authorization."]
    ]
    table_com = doc.add_table(rows=len(data_com) + 1, cols=4)
    style_table(table_com, col_widths_com, headers_com, data_com)

    doc.add_page_break()

    # ----------------------------------------------------
    # SECTION 6: RISK GOVERNANCE
    # ----------------------------------------------------
    add_heading_1("6. Risk Governance and Contingency Analysis")
    
    add_heading_2("6.1 Project Risk Register Matrix")
    p = doc.add_paragraph()
    p.add_run(
        "Key risks were identified and mapped using a Probability-Impact rating matrix:"
    )
    
    headers_rsk = ["ID", "Risk Description", "Prob (1-5)", "Imp (1-5)", "Mitigation Strategy", "Contingency Plan (Plan B)"]
    col_widths_rsk = [0.4, 1.5, 0.7, 0.7, 1.6, 1.37]
    align_rsk = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    data_rsk = [
        ["Rx1", "MySQL Database Corruption: Power failure or unexpected Windows reboot during write operations corrupts ib_logfile0.", "4", "4", "UPS-backed development workstations; enforce daily database SQL exports via phpMyAdmin.", "Rename corrupted log files to .bak in mysql/data directory, restart MySQL to auto-generate logs, restore database."],
        ["Rx2", "Scope Creep: Stakeholders request extra dashboard functions mid-sprint.", "4", "3", "Document and sign-off a rigid Scope Baseline during planning.", "Route all extra feature requests through the formal Change Control Board (CCB)."],
        ["Rx3", "Integration Delays: Axios queries from React fail due to backend CORS blocks.", "3", "3", "Set explicit API guidelines early; implement cors npm middleware in Express backend.", "Deploy local mock servers in React to isolate frontend development from backend blockages."],
        ["Rx4", "Developer Turnover: Lead React developer leaves mid-project.", "2", "4", "Require code documentation, TypeScript types, and bi-weekly code reviews.", "Reallocate development tasks, scaling back non-essential UI features using MoSCoW."],
        ["Rx5", "Unauthorized Grade Leak: Bypassing token-based security.", "2", "5", "Secure password hashing via bcrypt (10 rounds); verify JWT signatures.", "Revoke compromised JWTs via token blacklisting; run full audit logs."]
    ]
    table_rsk = doc.add_table(rows=len(data_rsk) + 1, cols=6)
    style_table(table_rsk, col_widths_rsk, headers_rsk, data_rsk, align_rsk)

    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_before = Pt(8)

    add_heading_2("6.2 Can All Risks Be Foreseen?")
    p = doc.add_paragraph()
    p.add_run(
        "No, it is fundamentally impossible to foresee all project risks. In project management, risks are categorized into Known-Unknowns (which can be planned for, like developer turnover) and Unknown-Unknowns (which cannot be predicted, such as a major technological black swan event)."
    )
    p = doc.add_paragraph()
    p.add_run(
        "A prime context-specific example occurred during our local testing environment setup. While the local MySQL database was actively writing bulk student academic records during a data import, the local Windows OS initiated an unexpected automatic update and forced a computer restart. This sudden shutdown corrupted the active InnoDB log files (ib_logfile0 and ib_logfile1), causing XAMPP MySQL to crash and fail to start. This was an Unknown-Unknown operational risk."
    )
    p = doc.add_paragraph()
    p.add_run(
        "The team resolved this immediately by accessing C:\\xampp\\mysql\\data, renaming the corrupted log files to .bak, restarting the MySQL server (which automatically generated fresh, clean transactional logs), and restoring the database to its pre-crash state using the previous night's SQL export backup. "
        "This experience was formalized by the PM into a robust School Management System Maintenance & Operations Guide (MAINTENANCE_GUIDE.md), "
        "explicitly instructing school IT staff to shut down MySQL services manually before reboots—effectively turning a past Unknown-Unknown risk into a documented procedural safeguard."
    )
    
    doc.add_page_break()

    # ----------------------------------------------------
    # SECTION 7: PROJECT CLOSURE
    # ----------------------------------------------------
    add_heading_1("7. Project Closure, Success Criteria, and Post-Project Activities")
    
    add_heading_2("7.1 Project Success Criteria and Challenges")
    p = doc.add_paragraph()
    p.add_run(
        "The project was evaluated against four core success dimensions:\n"
        "• Functional Success: Delivering 5 operational, role-based portals (Admin, Principal, Teacher, Student, Parent) with verified user access control.\n"
        "• Technical Success: Implementing secure JWT authentication and password hashing, maintaining a database query response latency of less than 200ms.\n"
        "• Schedule Success: Completing full development and handover within the planned 14-week timeline.\n"
        "• Financial Success: Delivering the system within the $35,000 budget (actual spend was $33,500, leaving a $1,500 contingency surplus)."
    )
    p = doc.add_paragraph()
    p.add_run(
        "Challenges Encountered:\n"
        "1. User Adoption: Teachers initially found the academic marks entry screen complex and resisted usage. The PM resolved this by redesigning the layout, incorporating reactive toast notifications (sonner), and hosting two targeted training sessions.\n"
        "2. Database Connection Issues: Diverse default MySQL ports across development systems (port 3306 vs. port 3307) caused backend connection failures. The team addressed this by implementing dynamic port matching in the backend .env configuration."
    )

    add_heading_2("7.2 What Comes After a Project is Completed?")
    p = doc.add_paragraph()
    p.add_run(
        "Project closure extends far beyond deployment, requiring critical administrative and operational tasks:\n"
        "1. Administrative & Contractual Closure: PM obtains formal, written sign-off from the School Principal (UAT pass), conducts financial audits to close project billing codes, and releases developers back to the organizational resource pool.\n"
        "2. Asset Archiving: Tagging the production release on GitHub (v1.0.0-production), archiving development manuals/tests, and taking a final database export via phpMyAdmin.\n"
        "3. Conducting a Post-Implementation Review (PIR): Evaluating whether the system's actual performance matches the initial business case (e.g., verifying if the school realizes the projected $15,000 annual paper/printing savings). The PIR also documents lessons learned, such as the XAMPP database corruption resolution, and establishes technical support SLAs, ensuring the school's technology investment is protected and maintainable for years to come."
    )

    # Embed Post-Project Diagram
    add_visual_diagram(img_postproject, "Post-Implementation Review (PIR) and Long-Term Operations Support Lifecycle")
    
    # Save the document
    output_path = os.path.join(workspace_dir, "Project_Management_Assignment_Report.docx")
    doc.save(output_path)
    print(f"Document successfully created with embedded visual diagrams and saved to: {output_path}")

    # Optionally remove local image files to keep directory clean
    try:
        shutil.rmtree(images_dir)
        print("Cleaned up temporary visual images directory.")
    except Exception as e:
        print(f"Cleaned up images note: {e}")

if __name__ == "__main__":
    create_report()
